export const getSvgFromCanvas = (canvas: HTMLCanvasElement | null) => {
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return "";

  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  const rects: string[] = [];

  for (let y = 0; y < height; y += 1) {
    let runStart = -1;

    for (let x = 0; x <= width; x += 1) {
      const index = (y * width + x) * 4;
      const isBlack = x < width && data[index] < 128;

      if (isBlack && runStart === -1) {
        runStart = x;
      }

      if ((!isBlack || x === width) && runStart !== -1) {
        rects.push(
          `<rect x="${runStart}" y="${y}" width="${x - runStart}" height="1" />`,
        );
        runStart = -1;
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges"><rect width="${width}" height="${height}" fill="white" /><g fill="black">${rects.join("")}</g></svg>`;
};

export const downloadText = (
  content: string,
  filename: string,
  type: string,
) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
