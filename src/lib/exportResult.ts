// Save or email a result from the user's own device. Nothing goes through our servers. Akash Sync Agent.
export function downloadText(name: string, text: string) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
/** mailto link opened in the user's own email app. Body is kept short; attach the downloaded file yourself. */
export function mailtoLink(subject: string, body: string) {
  const b = body.length > 1500 ? body.slice(0, 1500) + '\n…(full report in the attached file)' : body;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(b)}`;
}
