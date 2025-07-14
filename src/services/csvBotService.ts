export async function askCsvBot({
  query,
  payersFile,
  transactionsFile,
  sessionId,
}: {
  query: string;
  payersFile: File;
  transactionsFile: File;
  sessionId?: string;
}) {
  const formData = new FormData();
  formData.append("query", query);
  formData.append("payers", payersFile);
  formData.append("transactions", transactionsFile);
  if (sessionId) formData.append("sessionId", sessionId);

  const res = await fetch("https://csvbot.onrender.com/query", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("API request failed");
  return res.json();
}
