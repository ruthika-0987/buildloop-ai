export interface GoogleContact {
  resourceName: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  roleHint?: string;
}

export interface WorkspaceEmail {
  id: string;
  threadId: string;
  snippet: string;
  date?: string;
  from?: string;
  subject?: string;
}

/**
 * Fetch contacts using Google People API with the user's OAuth access token
 */
export async function fetchGoogleContacts(accessToken: string): Promise<GoogleContact[]> {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations&pageSize=50',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.warn('Google Contacts API responded with:', res.status, err);
      return [];
    }

    const data = await res.json();
    if (!data.connections || !Array.isArray(data.connections)) {
      return [];
    }

    return data.connections.map((person: any): GoogleContact => {
      const name = person.names?.[0]?.displayName || 'Unnamed Contact';
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      const photoUrl = person.photos?.[0]?.url;
      const org = person.organizations?.[0]?.name || person.organizations?.[0]?.title || '';

      return {
        resourceName: person.resourceName || '',
        name,
        email,
        phone,
        photoUrl,
        roleHint: org,
      };
    });
  } catch (error) {
    console.error('Failed to fetch Google Contacts:', error);
    return [];
  }
}

/**
 * Send an email using Gmail REST API (RFC 822 base64url encoded)
 */
export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  bodyText: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // UTF-8 RFC 2822 email format
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyText,
    ];
    const message = messageParts.join('\r\n');

    // Base64url encode
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: `Gmail error ${res.status}: ${errorText}` };
    }

    const data = await res.json();
    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('Failed to send Gmail message:', err);
    return { success: false, error: err.message || 'Network error sending email' };
  }
}

/**
 * Fetch recent C&D recovery emails from Gmail
 */
export async function fetchRecentGmailMessages(accessToken: string): Promise<WorkspaceEmail[]> {
  try {
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=BuildLoop OR order OR material OR dispatch OR cement OR bricks',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!listRes.ok) {
      return [];
    }

    const listData = await listRes.json();
    if (!listData.messages || !Array.isArray(listData.messages)) {
      return [];
    }

    const detailed = await Promise.all(
      listData.messages.slice(0, 5).map(async (msg: any) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (!detailRes.ok) return null;
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'No Subject';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

          return {
            id: detail.id,
            threadId: detail.threadId,
            snippet: detail.snippet || '',
            subject,
            from,
            date,
          };
        } catch {
          return null;
        }
      })
    );

    return detailed.filter((m): m is WorkspaceEmail => m !== null);
  } catch (error) {
    console.error('Failed to fetch Gmail messages:', error);
    return [];
  }
}
