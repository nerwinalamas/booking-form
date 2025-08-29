import { google, sheets_v4, Auth } from "googleapis";

const credentials = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const RANGE = "Sheet1!A:S"; // Adjust based on your columns

// Define type for booking data
export interface BookingData {
  fullName?: string;
  phoneNumber?: string;
  emailAddress?: string;
  propertyType?: string;
  serviceAddress?: string;
  serviceType?: string;
  specificService?: string;
  urgencyLevel?: string;
  budgetRange?: string;
  problemDescription?: string;
  preferredDate?: string;
  preferredTime?: string;
  alternativeDate?: string;
  alternativeTime?: string;
  accessInstructions?: string;
  specialRequests?: string;
  preferredContactMethod?: string;
  bestTimeToCall?: string;
}

class GoogleSheetsService {
  private auth: Auth.GoogleAuth | null;
  private sheets: sheets_v4.Sheets | null;

  constructor() {
    this.auth = null;
    this.sheets = null;
    this.init();
  }

  private async init() {
    try {
      // Create auth client
      this.auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      // Create sheets client
      this.sheets = google.sheets({ version: "v4", auth: this.auth });
      console.log("Google Sheets service initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Sheets service:", error);
      throw error;
    }
  }

  private async ensureInit() {
    if (!this.sheets) {
      await this.init();
    }
  }

  async addHeaders() {
    await this.ensureInit();

    try {
      const headers = [
        "Timestamp",
        "Full Name",
        "Phone Number",
        "Email Address",
        "Property Type",
        "Service Address",
        "Service Type",
        "Specific Service",
        "Urgency Level",
        "Budget Range",
        "Problem Description",
        "Preferred Date",
        "Preferred Time",
        "Alternative Date",
        "Alternative Time",
        "Access Instructions",
        "Special Requests",
        "Preferred Contact Method",
        "Best Time to Call",
      ];

      // Check if headers already exist
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: "Sheet1!1:1",
      });

      // If first row is empty, add headers
      if (!response.data.values || response.data.values.length === 0) {
        await this.sheets!.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: "Sheet1!1:1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [headers],
          },
        });
        console.log("Headers added successfully");
      }

      return { success: true };
    } catch (error) {
      console.error("Error adding headers:", error);
      throw error;
    }
  }

  async addBooking(bookingData: BookingData) {
    await this.ensureInit();

    try {
      // Ensure headers exist first
      await this.addHeaders();

      // Prepare the row data
      const values = [
        [
          new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" }),
          bookingData.fullName || "",
          bookingData.phoneNumber || "",
          bookingData.emailAddress || "",
          bookingData.propertyType || "",
          bookingData.serviceAddress || "",
          bookingData.serviceType || "",
          bookingData.specificService || "",
          bookingData.urgencyLevel || "",
          bookingData.budgetRange || "",
          bookingData.problemDescription || "",
          bookingData.preferredDate || "",
          bookingData.preferredTime || "",
          bookingData.alternativeDate || "",
          bookingData.alternativeTime || "",
          bookingData.accessInstructions || "",
          bookingData.specialRequests || "",
          bookingData.preferredContactMethod || "",
          bookingData.bestTimeToCall || "",
        ],
      ];

      // Append the data
      const response = await this.sheets!.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: RANGE,
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      console.log("Data added successfully:", response.data);
      return {
        success: true,
        updatedRows: response.data.updates?.updatedRows,
      };
    } catch (error) {
      console.error("Error adding booking data:", error);
      throw error;
    }
  }

  async getAllBookings() {
    await this.ensureInit();

    try {
      const response = await this.sheets!.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      });

      return {
        success: true,
        data: response.data.values || [],
      };
    } catch (error) {
      console.error("Error getting bookings:", error);
      throw error;
    }
  }
}

// Export a singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
