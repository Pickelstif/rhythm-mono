import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont, LineCapStyle } from 'pdf-lib';
import { format } from 'date-fns';
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches a song sheet PDF from storage and embeds it into a PDF document
 */
async function fetchAndEmbedSongSheet(
  songId: string, 
  songPath: string | null,
  title: string,
  pdfDoc: PDFDocument
): Promise<{ success: boolean, pages: number }> {
  try {
    // First try using the songPath if provided
    let signedUrl: string | null = null;
    
    if (songPath) {
      const { data: pathUrlData, error: pathUrlError } = await supabase
        .storage
        .from('song_sheets')
        .createSignedUrl(songPath, 60);
        
      if (!pathUrlError && pathUrlData?.signedUrl) {
        signedUrl = pathUrlData.signedUrl;
      } else {
        console.error(`Error getting signed URL for path ${songPath}:`, pathUrlError);
      }
    }
    
    // Fallback to the old method if path failed or wasn't provided
    if (!signedUrl) {
      const { data: urlData, error: urlError } = await supabase
        .storage
        .from('song_sheets')
        .createSignedUrl(`${songId}.pdf`, 60);
        
      if (urlError || !urlData?.signedUrl) {
        console.error(`Error getting signed URL for ID ${songId}:`, urlError);
        return { success: false, pages: 0 };
      }
      
      signedUrl = urlData.signedUrl;
    }
    
    // Fetch the PDF data
    const response = await fetch(signedUrl);
    if (!response.ok) {
      console.error(`Error fetching song sheet for "${title}":`, response.statusText);
      return { success: false, pages: 0 };
    }
    
    const pdfBytes = await response.arrayBuffer();
    
    // Embed the PDF
    const songSheetDoc = await PDFDocument.load(pdfBytes);
    const copiedPages = await pdfDoc.copyPages(songSheetDoc, songSheetDoc.getPageIndices());
    
    // Add all pages to the main document
    copiedPages.forEach(page => {
      pdfDoc.addPage(page);
    });
    
    return { success: true, pages: copiedPages.length };
  } catch (error) {
    console.error(`Error embedding song sheet for "${title}":`, error);
    return { success: false, pages: 0 };
  }
}

/**
 * Draw ruled lines on a page for note-taking
 */
function drawNotesLines(
  page: PDFPage, 
  startY: number, 
  font: PDFFont, 
  lineSpacing: number = 25,
  linesCount: number = 18
): void {
  const pageWidth = page.getWidth();
  const leftMargin = 50;
  const rightMargin = pageWidth - 50;
  
  // Draw "Notes:" label
  page.drawText("Notes:", {
    x: leftMargin,
    y: startY,
    size: 14,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  // Draw ruled lines
  for (let i = 0; i < linesCount; i++) {
    const lineY = startY - 20 - (i * lineSpacing);
    page.drawLine({
      start: { x: leftMargin, y: lineY },
      end: { x: rightMargin, y: lineY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.7,
      lineCap: LineCapStyle.Round,
    });
  }
}

/**
 * Generates a PDF document containing the setlist and embedded song sheets
 */
export async function generateSetlistPDF(
  event: {
    name: string;
    date: string | Date;
    venue: string;
    band_id: string;
    id: string;
  },
  songs: {
    id: string;
    title: string;
    artist: string;
    key: string | null;
    tempo: number | null;
    notes: string | null;
    song_order: number;
    has_sheet: boolean;
    songSheetPath?: string;
  }[],
  includeSheets: boolean = true
): Promise<Uint8Array | null> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Embed fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);
    
    // Set page dimensions (A4)
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    
    // Sort songs by order
    const sortedSongs = [...songs].sort((a, b) => a.song_order - b.song_order);
    
    // ------------------------
    // Create a stylish cover page
    // ------------------------
    const coverPage = pdfDoc.addPage([pageWidth, pageHeight]);
    
    // Draw stylish header block
    coverPage.drawRectangle({
      x: 0,
      y: pageHeight - 250,
      width: pageWidth,
      height: 250,
      color: rgb(0.2, 0.2, 0.3),
    });
    
    // Title
    const title = 'SETLIST';
    const titleWidth = helveticaBoldFont.widthOfTextAtSize(title, 48);
    coverPage.drawText(title, {
      x: (pageWidth - titleWidth) / 2,
      y: pageHeight - 150,
      size: 48,
      font: helveticaBoldFont,
      color: rgb(1, 1, 1),
    });
    
    // Event name with a stylish block
    coverPage.drawRectangle({
      x: 50,
      y: pageHeight - 320,
      width: pageWidth - 100,
      height: 60,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      opacity: 0.8,
    });
    
    const eventName = event.name;
    const eventNameWidth = helveticaBoldFont.widthOfTextAtSize(eventName, 24);
    coverPage.drawText(eventName, {
      x: (pageWidth - eventNameWidth) / 2,
      y: pageHeight - 290,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Event date
    const eventDate = event.date instanceof Date
      ? format(event.date, 'PPPP')
      : format(new Date(event.date), 'PPPP');
    const eventTime = event.date instanceof Date
      ? format(event.date, 'p')
      : format(new Date(event.date), 'p');
    
    const eventDateWidth = helveticaFont.widthOfTextAtSize(eventDate, 18);
    coverPage.drawText(eventDate, {
      x: (pageWidth - eventDateWidth) / 2,
      y: pageHeight - 380,
      size: 18,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Event time
    const eventTimeWidth = helveticaFont.widthOfTextAtSize(eventTime, 18);
    coverPage.drawText(eventTime, {
      x: (pageWidth - eventTimeWidth) / 2,
      y: pageHeight - 410,
      size: 18,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Venue with icon-like visual
    coverPage.drawRectangle({
      x: 50,
      y: pageHeight - 475,
      width: pageWidth - 100,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      opacity: 0.8,
    });
    
    coverPage.drawText("VENUE", {
      x: 70,
      y: pageHeight - 455,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    const venue = event.venue;
    coverPage.drawText(venue, {
      x: 130,
      y: pageHeight - 455,
      size: 18,
      font: helveticaFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Number of songs indicator
    coverPage.drawRectangle({
      x: 50,
      y: pageHeight - 550,
      width: pageWidth - 100,
      height: 50,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
      opacity: 0.8,
    });
    
    coverPage.drawText("SONGS", {
      x: 70,
      y: pageHeight - 530,
      size: 12,
      font: helveticaBoldFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    coverPage.drawText(`${sortedSongs.length}`, {
      x: 130,
      y: pageHeight - 530,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Add footer line
    coverPage.drawLine({
      start: { x: 50, y: 100 },
      end: { x: pageWidth - 50, y: 100 },
      thickness: 2,
      color: rgb(0.2, 0.2, 0.3),
      opacity: 0.5,
    });
    
    // Add footer text with date generated
    const footerText = `Generated on ${format(new Date(), 'PPP')}`;
    coverPage.drawText(footerText, {
      x: 50,
      y: 80,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // ------------------------
    // Create a setlist overview page
    // ------------------------
    let setlistPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yOffset = pageHeight - 100;
    
    // Header
    setlistPage.drawRectangle({
      x: 0,
      y: pageHeight - 80,
      width: pageWidth,
      height: 80,
      color: rgb(0.95, 0.95, 0.95),
    });
    
    // Setlist title
    const setlistTitle = 'SETLIST OVERVIEW';
    const setlistTitleWidth = helveticaBoldFont.widthOfTextAtSize(setlistTitle, 24);
    setlistPage.drawText(setlistTitle, {
      x: (pageWidth - setlistTitleWidth) / 2,
      y: pageHeight - 50,
      size: 24,
      font: helveticaBoldFont,
      color: rgb(0.2, 0.2, 0.3),
    });
    
    // Add a horizontal rule under the title
    setlistPage.drawLine({
      start: { x: 50, y: yOffset - 20 },
      end: { x: pageWidth - 50, y: yOffset - 20 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    
    yOffset -= 60;
    
    if (sortedSongs.length === 0) {
      setlistPage.drawText('No songs added to this event yet.', {
        x: 50,
        y: yOffset,
        size: 14,
        font: timesItalicFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    } else {
      // Add songs to the setlist overview page
      for (let i = 0; i < sortedSongs.length; i++) {
        const song = sortedSongs[i];
        const songNumber = `${i + 1}.`;
        const songTitle = song.title;
        const songArtist = song.artist ? `${song.artist}` : '';
        
        // Song number & title
        setlistPage.drawText(songNumber, {
          x: 50,
          y: yOffset,
          size: 14,
          font: helveticaBoldFont,
          color: rgb(0.2, 0.2, 0.3),
        });
        
        setlistPage.drawText(songTitle, {
          x: 80,
          y: yOffset,
          size: 14,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        
        // Artist (if available)
        if (songArtist) {
          setlistPage.drawText(songArtist, {
            x: 80,
            y: yOffset - 20,
            size: 12,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4),
          });
          
          yOffset -= 40;
        } else {
          yOffset -= 30;
        }
        
        // If we're running out of space, create a new page
        if (yOffset < 100) {
          const newSetlistPage = pdfDoc.addPage([pageWidth, pageHeight]);
          
          // Add header to continuation page
          newSetlistPage.drawRectangle({
            x: 0,
            y: pageHeight - 80,
            width: pageWidth,
            height: 80,
            color: rgb(0.95, 0.95, 0.95),
          });
          
          newSetlistPage.drawText('SETLIST OVERVIEW (CONTINUED)', {
            x: 50,
            y: pageHeight - 50,
            size: 24,
            font: helveticaBoldFont,
            color: rgb(0.2, 0.2, 0.3),
          });
          
          setlistPage = newSetlistPage;
          yOffset = pageHeight - 120;
          
          // Add a horizontal rule
          setlistPage.drawLine({
            start: { x: 50, y: yOffset - 20 },
            end: { x: pageWidth - 50, y: yOffset - 20 },
            thickness: 1,
            color: rgb(0.7, 0.7, 0.7),
          });
          
          yOffset -= 60;
        }
      }
    }
    
    // ------------------------
    // Process each song
    // ------------------------
    for (let i = 0; i < sortedSongs.length; i++) {
      const song = sortedSongs[i];
      const songNumber = i + 1;
      
      // If the song has a sheet and we're including sheets, just embed it
      if (includeSheets && song.has_sheet) {
        // Directly embed song sheet without creating a header page
        try {
          await fetchAndEmbedSongSheet(
            song.id, 
            song.songSheetPath || null, 
            song.title, 
            pdfDoc
          );
        } catch (error) {
          console.error(`Error embedding song sheet for ${song.title}:`, error);
          
          // If embedding fails, add a page with error message and note-taking space
          const errorPage = pdfDoc.addPage([pageWidth, pageHeight]);
          errorPage.drawText("Error: Could not load song sheet", {
            x: 50,
            y: pageHeight - 150,
            size: 16,
            font: helveticaFont,
            color: rgb(0.8, 0.2, 0.2),
          });
          
          // Add notes lines for writing
          drawNotesLines(errorPage, pageHeight - 200, helveticaBoldFont);
        }
      } else {
        // For songs without sheets, create a dedicated page with note lines
        const songPage = pdfDoc.addPage([pageWidth, pageHeight]);
        
        // Create a colored header bar
        songPage.drawRectangle({
          x: 0,
          y: pageHeight - 80,
          width: pageWidth,
          height: 80,
          color: rgb(0.95, 0.95, 0.95),
        });
        
        // Song number and title
        const songTitle = `${songNumber}. ${song.title}`;
        const songTitleWidth = helveticaBoldFont.widthOfTextAtSize(songTitle, 24);
        songPage.drawText(songTitle, {
          x: (pageWidth - songTitleWidth) / 2,
          y: pageHeight - 50,
          size: 24,
          font: helveticaBoldFont,
          color: rgb(0.2, 0.2, 0.3),
        });
        
        // Artist
        if (song.artist) {
          const artistText = song.artist;
          const artistTextWidth = helveticaFont.widthOfTextAtSize(artistText, 16);
          songPage.drawText(artistText, {
            x: (pageWidth - artistTextWidth) / 2,
            y: pageHeight - 80,
            size: 16,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
          });
        }
        
        let detailsYOffset = pageHeight - 150;
        
        // Metadata box for key and tempo
        if (song.key || song.tempo) {
          songPage.drawRectangle({
            x: 50,
            y: detailsYOffset - 10,
            width: pageWidth - 100,
            height: 40,
            color: rgb(0.97, 0.97, 0.97),
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 1,
          });
          
          let metadataText = '';
          
          if (song.key && song.tempo) {
            metadataText = `Key: ${song.key} | Tempo: ${song.tempo} BPM`;
          } else if (song.key) {
            metadataText = `Key: ${song.key}`;
          } else if (song.tempo) {
            metadataText = `Tempo: ${song.tempo} BPM`;
          }
          
          const metadataTextWidth = helveticaFont.widthOfTextAtSize(metadataText, 14);
          songPage.drawText(metadataText, {
            x: (pageWidth - metadataTextWidth) / 2,
            y: detailsYOffset,
            size: 14,
            font: helveticaFont,
            color: rgb(0.3, 0.3, 0.3),
          });
          
          detailsYOffset -= 60;
        }
        
        // Notes section
        if (song.notes) {
          songPage.drawText('Notes:', {
            x: 50,
            y: detailsYOffset,
            size: 14,
            font: helveticaBoldFont,
            color: rgb(0.3, 0.3, 0.3),
          });
          
          detailsYOffset -= 25;
          
          // Handle multi-line notes
          const notesLines = song.notes.split('\n');
          for (const line of notesLines) {
            songPage.drawText(line, {
              x: 50,
              y: detailsYOffset,
              size: 12,
              font: helveticaFont,
              color: rgb(0.3, 0.3, 0.3),
            });
            
            detailsYOffset -= 20;
          }
          
          detailsYOffset -= 20;
        } else {
          detailsYOffset -= 30;
        }
        
        // Add ruled lines for handwriting notes
        drawNotesLines(songPage, detailsYOffset, helveticaBoldFont);
      }
    }
    
    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

/**
 * Downloads the generated PDF
 */
export async function downloadSetlistPDF(
  event: {
    name: string;
    date: string | Date;
    venue: string;
    band_id: string;
    id: string;
  },
  songs: {
    id: string;
    title: string;
    artist: string;
    key: string | null;
    tempo: number | null;
    notes: string | null;
    song_order: number;
    has_sheet: boolean;
    songSheetPath?: string;
  }[],
  includeSheets: boolean = true
): Promise<void> {
  const pdfBytes = await generateSetlistPDF(event, songs, includeSheets);
  
  if (!pdfBytes) {
    console.error('Failed to generate PDF');
    return;
  }
  
  // Create a blob from the PDF bytes
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  // Create an object URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link and click it to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.name.replace(/\s+/g, '_')}_Setlist.pdf`;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 