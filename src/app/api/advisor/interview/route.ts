import { NextResponse } from "next/server";
import { getProfileBySlug } from "@/lib/profiles";
import { evaluateInterviewStep } from "@/lib/ai/gemini";
import { getApplicationById, saveApplication } from "@/lib/applications";
import { InterviewMessage } from "@/types/advisor";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      profileSlug = "mi-perfil",
      jobContext,
      chatHistory = [],
      candidateAnswer,
      applicationId,
      model,
      preferredModel,
      profile: profileFromBody,
    } = body;

    if (!candidateAnswer || candidateAnswer.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Respuesta requerida para evaluar" },
        { status: 400 }
      );
    }

    const profile = profileFromBody || (await getProfileBySlug(profileSlug));
    if (!profile) {
      return NextResponse.json(
        { success: false, error: `Perfil '${profileSlug}' no encontrado` },
        { status: 404 }
      );
    }

    const result = await evaluateInterviewStep(
      profile,
      jobContext || "Vacante Full Stack Developer",
      chatHistory,
      candidateAnswer,
      model || preferredModel
    );

    const userMessage: InterviewMessage = {
      id: "msg-" + Date.now(),
      sender: "candidate",
      content: candidateAnswer,
      timestamp: new Date().toISOString(),
      feedback: result.feedback,
    };

    const interviewerMessage: InterviewMessage = {
      id: "msg-" + (Date.now() + 1),
      sender: "interviewer",
      content: result.interviewerReply,
      timestamp: new Date().toISOString(),
    };

    if (applicationId) {
      try {
        const application = await getApplicationById(applicationId);
        if (application) {
          application.interviewMessages = application.interviewMessages || [];
          application.interviewMessages.push(userMessage, interviewerMessage);
          await saveApplication(application);
        }
      } catch {
        // Ignore if local application ID not found on server disk
      }
    }

    return NextResponse.json({
      success: true,
      interviewerReply: result.interviewerReply,
      feedback: result.feedback,
      messages: [userMessage, interviewerMessage],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
