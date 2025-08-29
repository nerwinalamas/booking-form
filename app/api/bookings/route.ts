import { NextResponse } from "next/server";
import googleSheetsService from "@/lib/google-sheets";

export async function POST(request: Request) {
  try {
    const bookingData = await request.json();

    console.log("Received booking data:", bookingData);

    // Validate required fields
    const requiredFields = [
      "fullName",
      "phoneNumber",
      "emailAddress",
      "serviceType",
    ];
    const missingFields = requiredFields.filter((field) => !bookingData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Format dates if they exist
    if (bookingData.preferredDate) {
      bookingData.preferredDate = new Date(
        bookingData.preferredDate
      ).toLocaleDateString("en-PH");
    }
    if (bookingData.alternativeDate) {
      bookingData.alternativeDate = new Date(
        bookingData.alternativeDate
      ).toLocaleDateString("en-PH");
    }

    // Add to Google Sheets
    const result = await googleSheetsService.addBooking(bookingData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Booking submitted successfully!",
        data: result,
      });
    } else {
      throw new Error("Failed to add booking to sheet");
    }
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error. Please try again.",
        error:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : String(error)
            : "Server error",
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: "Booking API endpoint is working. Use POST to submit bookings.",
  });
}
