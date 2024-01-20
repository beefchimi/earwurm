async function fetchRequest(path: string, options?: RequestInit) {
  const audioRequest = new Request(path, options);

  return await fetch(audioRequest).then((response) => {
    if (!response.ok) throw new Error(`Network status: ${response.status}`);
    return response;
  });
}

export async function fetchAudioBuffer(
  path: string,
  context: AudioContext,
  options?: RequestInit,
) {
  return await fetchRequest(path, options)
    .then(async (response) => await response.arrayBuffer())
    .then(async (arrayBuffer) => await context.decodeAudioData(arrayBuffer));
}
