import { type NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Website from "@/models/Website"
import { sendReminderEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    // Verify this is a cron job or authorized request
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    // Find websites with scheduled reminders that haven't been sent
    const now = new Date()
    const websitesWithReminders = await Website.find({
      scheduledFor: { $lte: now },
      reminderSent: false,
    }).lean()

    let emailsSent = 0
    let errors = 0

    for (const website of websitesWithReminders) {
      try {
        // Get user name from email (simple extraction)
        const userName = website.userId.split("@")[0]

        const emailSent = await sendReminderEmail(website.userId, userName, {
          title: website.title,
          url: website.url,
          type: website.type,
          scheduledFor: website.scheduledFor!,
        })

        if (emailSent) {
          // Mark reminder as sent
          await Website.findByIdAndUpdate(website._id, {
            reminderSent: true,
          })
          emailsSent++
        } else {
          errors++
        }
      } catch (error) {
        console.error(`Error sending reminder for website ${website._id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      message: `Processed ${websitesWithReminders.length} reminders`,
      emailsSent,
      errors,
    })
  } catch (error) {
    console.error("Error processing reminders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
