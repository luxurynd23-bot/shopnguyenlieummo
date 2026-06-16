import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getVipLevel(totalDeposit: number) {
  if (totalDeposit >= 50000000) return "DIAMOND";
  if (totalDeposit >= 20000000) return "GOLD";
  if (totalDeposit >= 5000000) return "SILVER";
  return "BRONZE";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("PAYOS WEBHOOK:", JSON.stringify(body, null, 2));

    const data = body?.data;

    if (!data) {
      return NextResponse.json({ ok: false, message: "Không có data" });
    }

    const orderCode = String(data.orderCode || "");
    const status = String(data.status || data.code || "").toUpperCase();
    const paidAmount = Number(data.amount || data.transferAmount || 0);

    if (!orderCode) {
      return NextResponse.json({
        ok: false,
        message: "Thiếu orderCode",
      });
    }

    if (status && status !== "PAID" && status !== "00" && status !== "SUCCESS") {
      return NextResponse.json({
        ok: true,
        message: "Webhook không phải thanh toán thành công",
        status,
      });
    }

    const deposit = await prisma.deposit.findFirst({
      where: { note: orderCode },
    });

    if (!deposit) {
      return NextResponse.json({
        ok: false,
        message: "Không tìm thấy lệnh nạp",
      });
    }

    if (deposit.status === "SUCCESS") {
      return NextResponse.json({
        ok: true,
        message: "Lệnh này đã cộng trước đó",
      });
    }

    if (paidAmount > 0 && paidAmount !== deposit.amount) {
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          ok: false,
          message: "Số tiền thanh toán không khớp",
          paidAmount,
          expectedAmount: deposit.amount,
        },
        { status: 400 }
      );
    }

    let commissionAmount = 0;
    let newVipLevel = "BRONZE";

    await prisma.$transaction(async (tx) => {
      await tx.deposit.update({
        where: { id: deposit.id },
        data: { status: "SUCCESS" },
      });

      const updatedUser = await tx.user.update({
        where: { id: deposit.userId },
        data: {
          balance: {
            increment: deposit.amount,
          },
          totalDeposit: {
            increment: deposit.amount,
          },
        },
        select: {
          id: true,
          totalDeposit: true,
          referredBy: true,
        },
      });

      await tx.walletHistory.create({
        data: {
          userId: deposit.userId,
          type: "DEPOSIT",
          amount: deposit.amount,
          note: `Nạp tiền PayOS #${orderCode}`,
        },
      });

      newVipLevel = getVipLevel(updatedUser.totalDeposit);

      await tx.user.update({
        where: { id: updatedUser.id },
        data: {
          vipLevel: newVipLevel as any,
        },
      });

      if (updatedUser.referredBy) {
        const referrer = await tx.user.findFirst({
          where: {
            referralCode: updatedUser.referredBy,
          },
          select: {
            id: true,
          },
        });

        if (referrer) {
          commissionAmount = Math.floor(deposit.amount * 0.05);

          await tx.user.update({
            where: {
              id: referrer.id,
            },
            data: {
              referralBalance: {
                increment: commissionAmount,
              },
            },
          });

          await tx.referralCommission.create({
            data: {
              referrerId: referrer.id,
              referredUserId: updatedUser.id,
              amount: deposit.amount,
              commission: commissionAmount,
            },
          });

          await tx.walletHistory.create({
            data: {
              userId: referrer.id,
              type: "REFERRAL_COMMISSION",
              amount: commissionAmount,
              note: `Hoa hồng giới thiệu từ user ${updatedUser.id}`,
            },
          });
        }
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Cộng tiền thành công",
      amount: deposit.amount,
      commission: commissionAmount,
      vipLevel: newVipLevel,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: "Lỗi webhook",
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}