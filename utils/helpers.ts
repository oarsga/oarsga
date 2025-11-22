export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateFilename = (prompt: string, seed: number) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const slug = prompt.slice(0, 20).replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${timestamp}_${slug}_${seed}.png`;
};
