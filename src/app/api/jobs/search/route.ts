import { NextResponse } from "next/server";
import { searchJobs, buildExternalSearchUrls } from "@/lib/jobs/search";
import { JobSearchParams } from "@/types/job-search";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const params: JobSearchParams = {
      query: searchParams.get("query") || "Full Stack",
      country: searchParams.get("country") || "Chile",
      city: searchParams.get("city") || "",
      region: searchParams.get("region") || "",
      publishedWithinDays: searchParams.get("days")
        ? parseInt(searchParams.get("days")!, 10)
        : 30,
      fromDate: searchParams.get("fromDate") || undefined,
      modality: (searchParams.get("modality") as JobSearchParams["modality"]) || "all",
    };

    const jobs = await searchJobs(params);
    const externalUrls = buildExternalSearchUrls(params);

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
      externalUrls,
      params,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as JobSearchParams;
    const jobs = await searchJobs(body);
    const externalUrls = buildExternalSearchUrls(body);

    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
      externalUrls,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
