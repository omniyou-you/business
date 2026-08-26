import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }

    // Fetch all print jobs ordered by latest creation
    const allJobs = await db.printJob.findMany({
      orderBy: { created_at: "desc" },
      take: 100, // Limit to 100 recent jobs for performance
    });

    // Compute metrics
    const totalOrders = allJobs.length;

    const totalRevenue = allJobs
      .filter((j) => j.payment_status === "VERIFIED")
      .reduce((sum, j) => sum + j.calculated_price, 0);

    const completedJobs = allJobs.filter((j) => j.print_status === "COMPLETED" || j.print_status === "PRINTED").length;

    const activeJobs = allJobs.filter(
      (j) => j.payment_status === "VERIFIED" && j.print_status !== "COMPLETED" && j.print_status !== "PRINTED"
    ).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        completedJobs,
        activeJobs,
      },
      orders: allJobs,
    });
  } catch (error: any) {
    console.error("Admin stats API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
