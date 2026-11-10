(() => {
  const $ = (id) => document.getElementById(id);
  const client = window.supabase?.createClient(window.SOUNDBOX_CONFIG.supabaseUrl, window.SOUNDBOX_CONFIG.supabaseKey);
  const bucket = 'soundbox-audio';
  let recorder, chunks = [], currentBlob, currentClipId, seconds = 0, timerId, toastId;
  const status = (message) => { $('statusLine').textContent = message; };
  const toast = (message) => { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastId); toastId = setTimeout(() => el.classList.remove('show'), 3200); };

  if (!client) status('연결 설정을 불러오지 못했어요.');
  else status('소리함이 열렸어요. 누군가의 소리를 들어보세요.');

  $('listenButton').addEventListener('click', async () => {
    if (!client) return toast('Supabase 연결을 확인해 주세요.');
    $('listenButton').disabled = true;
    try {
      const { data, error } = await client.from('soundbox_clips').select('id, object_path, duration_seconds, created_at').order('created_at', { ascending: false }).limit(40);
      if (error) throw error;
      if (!data?.length) { toast('아직 도착한 소리가 없어요. 첫 번째 소리를 남겨주세요.'); return; }
      const clip = data[Math.floor(Math.random() * data.length)];
      const { data: file } = client.storage.from(bucket).getPublicUrl(clip.object_path);
      currentClipId = clip.id;
      $('audioPlayer').src = file.publicUrl;
      $('clipLabel').textContent = `누군가의 ${clip.duration_seconds}초`;
      $('playerCard').hidden = false;
      $('audioPlayer').play().catch(() => {});
      $('playerCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
      status('새로운 소리를 만났어요.');
    } catch (error) { console.error(error); toast('소리를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'); }
    finally { $('listenButton').disabled = false; }
  });

  $('writeButton').addEventListener('click', () => $('recordSection').scrollIntoView({ behavior: 'smooth' }));
  $('recordButton').addEventListener('click', async () => {
    if (recorder?.state === 'recording') { recorder.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('이 브라우저에서는 녹음을 지원하지 않아요.');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks = []; seconds = 0; $('timer').innerHTML = '00:00 <span>/ 00:05</span>';
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        clearInterval(timerId); stream.getTracks().forEach((track) => track.stop());
        currentBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (!currentBlob.size) return toast('녹음된 소리가 없어요. 다시 시도해 주세요.');
        $('previewPlayer').src = URL.createObjectURL(currentBlob);
        $('previewArea').hidden = false; $('recordHint').textContent = '올리기 전에 녹음을 확인해 보세요.';
        $('recordButton').classList.remove('recording'); $('micVisual').classList.remove('active');
      };
      recorder.start(); $('recordButton').classList.add('recording'); $('micVisual').classList.add('active');
      $('recordHint').textContent = '지금의 소리를 담고 있어요. 버튼을 다시 누르면 끝나요.';
      timerId = setInterval(() => { seconds++; $('timer').innerHTML = `00:0${seconds} <span>/ 00:05</span>`; if (seconds >= 5 && recorder.state === 'recording') recorder.stop(); }, 1000);
    } catch (error) { console.error(error); toast('마이크 권한을 허용한 뒤 다시 눌러주세요.'); }
  });

  $('discardButton').addEventListener('click', () => { currentBlob = null; $('previewArea').hidden = true; $('recordHint').textContent = '마이크를 누르고, 지금의 소리를 담아보세요.'; $('timer').innerHTML = '00:00 <span>/ 00:05</span>'; });
  $('uploadButton').addEventListener('click', async () => {
    if (!client || !currentBlob) return toast('먼저 소리를 녹음해 주세요.');
    if (currentBlob.size > 1_500_000) return toast('파일 크기가 제한을 넘었어요. 짧게 다시 녹음해 주세요.');
    $('uploadButton').disabled = true; $('uploadButton').textContent = '소리를 놓는 중…';
    const ext = currentBlob.type.includes('mp4') ? 'mp4' : currentBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      const { error: uploadError } = await client.storage.from(bucket).upload(path, currentBlob, { contentType: currentBlob.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: rowError } = await client.from('soundbox_clips').insert({ object_path: path, duration_seconds: Math.max(1, seconds || 1) });
      if (rowError) { await client.storage.from(bucket).remove([path]); throw rowError; }
      currentBlob = null; $('previewArea').hidden = true; $('recordHint').textContent = '소리를 놓고 왔어요. 고마워요.';
      $('timer').innerHTML = '00:00 <span>/ 00:05</span>'; status('새로운 소리가 소리함에 도착했어요.'); toast('익명으로 소리를 남겼어요.');
    } catch (error) { console.error(error); toast('업로드에 실패했어요. 연결이나 파일 형식을 확인해 주세요.'); }
    finally { $('uploadButton').disabled = false; $('uploadButton').textContent = '익명으로 올리기'; }
  });

  $('reportButton').addEventListener('click', () => $('reportDialog').showModal());
  $('submitReportButton').addEventListener('click', async (event) => {
    event.preventDefault();
    if (!currentClipId) return;
    const reason = document.querySelector('input[name="reason"]:checked').value;
    const { error } = await client.from('soundbox_reports').insert({ clip_id: currentClipId, reason });
    $('reportDialog').close();
    if (error) toast('신고를 보내지 못했어요.'); else toast('신고를 접수했어요. 알려줘서 고마워요.');
  });
  $('clearLocalButton').addEventListener('click', () => { $('audioPlayer').pause(); $('audioPlayer').removeAttribute('src'); $('previewPlayer').pause(); $('previewPlayer').removeAttribute('src'); currentBlob = null; $('previewArea').hidden = true; $('playerCard').hidden = true; toast('이 기기에서 재생 중인 소리를 지웠어요.'); });
})();

