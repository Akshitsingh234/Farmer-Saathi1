
import { google } from 'googleapis';

export const createCalendarEvent = async (summary: string, description: string, startTime: string, endTime: string, accessToken: string) => {
  if (!accessToken) {
    console.error('Could not get OAuth token');
    return;
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = {
    summary,
    description,
    start: {
      dateTime: startTime,
      timeZone: 'America/Los_Angeles', // Adjust to user's timezone
    },
    end: {
      dateTime: endTime,
      timeZone: 'America/Los_Angeles', // Adjust to user's timezone
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    console.log('Event created: ', response.data.htmlLink);
  } catch (error) {
    console.error('Error creating calendar event', error);
  }
};
