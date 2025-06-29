
// src/app/client-portal/email/page.tsx
"use client";

import * as React from 'react';
import Script from 'next/script';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { PlaceholderCard } from '@/components/dashboard/PlaceholderCard';
import { Loader2, Mail, LogIn, LogOut, RefreshCcw, Send } from 'lucide-react'; // Added LogIn, LogOut, RefreshCcw
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea

interface GmailMessageHeader {
  name: string;
  value: string;
}

interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename: string;
  headers: GmailMessageHeader[];
  body: {
    size: number;
    data?: string; // Base64url encoded string
  };
}
interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: GmailMessageHeader[];
    parts?: GmailMessagePart[];
    body?: {
        size: number;
        data?: string;
    };
  };
  internalDate: string; // epoch ms string
}

declare global {
  interface Window {
    gapi: any;
    google: any; // For new Google Identity Services
  }
}

// TODO: Replace with your actual Google Cloud API Key and OAuth Client ID from environment variables
// Ensure these are prefixed with NEXT_PUBLIC_ if used client-side
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY || "YOUR_GOOGLE_CLOUD_API_KEY_PLACEHOLDER";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID || "YOUR_GOOGLE_OAUTH_CLIENT_ID_PLACEHOLDER";


export default function ClientPortalEmailPage() {
  const { user, accessToken, isLoading: isAuthLoading, signInWithGoogleAndGetGmailToken, signOutGoogle } = useAuth();
  const [gapiReady, setGapiReady] = React.useState(false);
  const [messages, setMessages] = React.useState<GmailMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isGapiScriptLoaded, setIsGapiScriptLoaded] = React.useState(false);

  const GMAIL_DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
  const GMAIL_SCOPES = "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send";

  const handleGapiScriptLoad = () => {
    console.log("Google API Script loaded.");
    setIsGapiScriptLoaded(true);
    // gapi.load will be called once accessToken is available
  };

  const initializeGapiClient = React.useCallback(async () => {
    if (!accessToken) {
      console.error("No access token available to initialize GAPI client.");
      setErrorMessage("Authentication token is missing. Please sign in again.");
      return;
    }
    if (GOOGLE_API_KEY.includes("PLACEHOLDER") || GOOGLE_CLIENT_ID.includes("PLACEHOLDER")) {
      console.warn("Placeholder Google API Key or Client ID detected. GAPI client not initialized.");
      setErrorMessage("Gmail API client is not configured by the developer. Please provide API Key and Client ID.");
      setGapiReady(false); // Ensure gapiReady is false if config is missing
      return;
    }

    console.log("Attempting to initialize GAPI client...");
    try {
      await window.gapi.client.init({
        apiKey: GOOGLE_API_KEY,
        clientId: GOOGLE_CLIENT_ID, // Not strictly needed for client.init but good practice
        discoveryDocs: [GMAIL_DISCOVERY_DOC],
        // scope: GMAIL_SCOPES, // Scope is handled by Firebase Auth and token
      });
      window.gapi.client.setToken({ access_token: accessToken });
      setGapiReady(true);
      console.log("GAPI client initialized successfully.");
      setErrorMessage(null); // Clear previous errors
    } catch (error: any) {
      console.error("Error initializing GAPI client:", error);
      setErrorMessage(`Failed to initialize Gmail API client: ${error.details || error.message || 'Unknown error'}`);
      setGapiReady(false);
    }
  }, [accessToken]);

  React.useEffect(() => {
    if (isGapiScriptLoaded && accessToken && !gapiReady) {
      window.gapi.load('client', initializeGapiClient);
    }
  }, [isGapiScriptLoaded, accessToken, gapiReady, initializeGapiClient]);

  const fetchMessages = React.useCallback(async () => {
    if (!gapiReady || !user || !accessToken) {
      setErrorMessage("Gmail API client not ready or user not authenticated.");
      return;
    }
    setIsLoadingMessages(true);
    setErrorMessage(null);
    console.log("Fetching Gmail messages...");
    try {
      const response = await window.gapi.client.gmail.users.messages.list({
        userId: 'me',
        maxResults: 15,
        q: 'is:inbox category:primary',
      });
      
      console.log("Messages list response:", response);
      const messageItems: GmailMessage[] = [];
      if (response.result.messages && response.result.messages.length > 0) {
        const batch = window.gapi.client.newBatch();
        response.result.messages.forEach((message: { id: string }) => {
          batch.add(window.gapi.client.gmail.users.messages.get({ 
            userId: 'me', 
            id: message.id, 
            format: 'metadata', 
            metadataHeaders: ['Subject', 'From', 'Date', 'To', 'Cc'] 
          }));
        });

        const batchResponse = await batch;
        console.log("Batch response for message details:", batchResponse);
        for (const key in batchResponse.result) {
          messageItems.push(batchResponse.result[key].result as GmailMessage);
        }
        // Sort by date descending
        setMessages(messageItems.sort((a,b) => parseInt(b.internalDate) - parseInt(a.internalDate)));
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      const errorDetail = error.result?.error;
      setErrorMessage(`Failed to fetch messages: ${errorDetail?.message || error.message || 'Unknown error'}. Status: ${errorDetail?.status || 'N/A'}`);
      if (errorDetail?.status === 'UNAUTHENTICATED' || error.status === 401) {
        setErrorMessage("Authentication error. Your session might have expired. Please try signing out and signing in again.");
        // Consider calling signOutGoogle() here or providing a specific re-auth button
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [gapiReady, user, accessToken, signOutGoogle]); 

  React.useEffect(() => {
    if (gapiReady) {
      fetchMessages();
    }
  }, [gapiReady, fetchMessages]);
  
  const getHeaderValue = (headers: GmailMessageHeader[] | undefined, name: string): string => {
    if (!headers) return 'N/A';
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : 'N/A';
  };

  if (isAuthLoading && !user) { // Show loader only if auth is truly loading and no user yet
    return (
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 md:p-8 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="lazyOnload" // Changed strategy
        onLoad={handleGapiScriptLoad}
        onError={(e) => {
          console.error('Google API Script failed to load:', e);
          setErrorMessage("Failed to load Google API script. Please check your internet connection or ad-blocking software, then refresh.");
        }}
      />
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#5b21b6]/10 to-[#000104] flex-1 p-6 space-y-6 md:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Email</h1>
          {user ? (
            <Button variant="outline" onClick={signOutGoogle} disabled={isAuthLoading}>
              {isAuthLoading && !accessToken ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogOut className="mr-2 h-4 w-4" />} 
              Sign Out ({user.displayName?.split(' ')[0]})
            </Button>
          ) : (
             <Button onClick={signInWithGoogleAndGetGmailToken} className="bg-primary hover:bg-primary/80" disabled={isAuthLoading || !isGapiScriptLoaded}>
               {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <LogIn className="mr-2 h-4 w-4" />} 
               Sign in with Google
            </Button>
          )}
        </div>
         {(GOOGLE_API_KEY.includes("PLACEHOLDER") || GOOGLE_CLIENT_ID.includes("PLACEHOLDER")) && !user &&
            <p className="text-xs text-yellow-400 text-center mt-2 p-2 bg-yellow-500/10 border border-yellow-500/50 rounded-md">
              Developer Note: Gmail integration requires Google API Key & OAuth Client ID to be configured in environment variables (NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY, NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID).
            </p>
         }

        {user && !gapiReady && !errorMessage && (
          <PlaceholderCard title="Initializing Gmail Integration...">
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Please wait, preparing your inbox...</p>
            </div>
          </PlaceholderCard>
        )}

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm my-4">
            <p className="font-semibold">Error:</p>
            <p>{errorMessage}</p>
          </div>
        )}

        {user && gapiReady && !errorMessage && (
          <>
            <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={fetchMessages} disabled={isLoadingMessages}>
                    <RefreshCcw className={`mr-2 h-4 w-4 ${isLoadingMessages ? 'animate-spin' : ''}`}/> Refresh
                </Button>
                <Button variant="default" className="bg-primary hover:bg-primary/80" disabled>
                    <Send className="mr-2 h-4 w-4"/> Compose
                </Button>
            </div>
            <PlaceholderCard title={`Inbox (${messages.length > 0 ? messages.length : 'No'} Messages)`}>
              {isLoadingMessages ? (
                <div className="flex items-center justify-center p-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground text-center p-4">No messages found in your primary inbox or an error occurred.</p>
              ) : (
                <ScrollArea className="h-[50vh] pr-3">
                  <ul className="space-y-3">
                    {messages.map((msg) => (
                      <li key={msg.id} className="p-3 border border-border/30 rounded-md hover:bg-muted/20 transition-colors cursor-pointer bg-black/30">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-foreground text-sm truncate" title={getHeaderValue(msg.payload?.headers, 'Subject')}>{getHeaderValue(msg.payload?.headers, 'Subject') || '(No Subject)'}</p>
                          <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(parseInt(msg.internalDate)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate" title={getHeaderValue(msg.payload?.headers, 'From')}>From: {getHeaderValue(msg.payload?.headers, 'From')}</p>
                        <p className="text-xs text-muted-foreground/80 mt-1 truncate">{msg.snippet}</p>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </PlaceholderCard>
          </>
        )}
         {!user && !isAuthLoading && !isGapiScriptLoaded &&
            <PlaceholderCard title="Gmail Integration Unavailable">
                 <p className="text-muted-foreground text-center p-4">
                    The Google API script could not be loaded. Please check your internet connection, disable any ad-blockers that might interfere with Google scripts, and refresh the page.
                 </p>
            </PlaceholderCard>
         }
      </main>
    </>
  );
}
