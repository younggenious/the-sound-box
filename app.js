(() => {
  const $ = (id) => document.getElementById(id);
  const client = window.supabase && window.SOUNDBOX_CONFIG
    ? window.supabase.createClient(window.SOUNDBOX_CONFIG.supabaseUrl, window.SOUNDBOX_CONFIG.supabaseKey)
    : null;
  const bucket = 'soundbox-audio';
  let currentClipId = null;
  let language = 'ko';
  let toastId;
  let recorder = null;
  let chunks = [];
  let currentBlob = null;
  let seconds = 0;
  let timerId = null;
  let startedAt = 0;
  let previewUrl = null;

  const copy = {
    ko: {
      brand:'소리함', privacy:'이름 없이, 가볍게', title:'소리함 — 오늘의 작은 목소리', description:'이름 없이 남기고, 누군가의 소리를 우연히 만나는 익명의 소리함',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'말 대신,', line2:'소리를 만나보세요.', intro1:'오늘의 한숨, 작은 웃음, 혹은 아무 말 없는 5초.', intro2:'누군가 남긴 순간을 우연히 만나보세요.',
      listen:'랜덤 소리 듣기', write:'내 소리 남기기', ready:'소리함이 열렸어요. 누군가의 소리를 들어보세요.', noConfig:'연결 설정을 불러오지 못했어요.', loading:'소리를 찾고 있어요…', empty:'아직 도착한 소리가 없어요. 나중에 다시 들러주세요.', newClip:'새로운 소리를 만났어요.', fetchError:'소리를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', connectionError:'Supabase 연결을 확인해 주세요.', clipLabel:'누군가의 {seconds}초 소리',
      recordEyebrow:'LEAVE A SOUND', recordTitle:'오늘의 소리를<br>놓고 갈까요?', recordAside:'짧은 소리는 때론<br>긴 말보다 잘 전해져요.', recordHint:'마이크를 누르고, 지금의 소리를 담아보세요.', recordCaption:'버튼을 눌러 녹음 · 최대 5초', recordStart:'녹음 시작', recordStop:'녹음 중지', recording:'지금의 소리를 담고 있어요. 버튼을 다시 누르면 끝나요.', preview:'올리기 전에 녹음을 확인해 보세요.', upload:'익명으로 올리기', discard:'다시 녹음', finePrint:'녹음은 최대 5초이며, 올린 소리는 누구나 들을 수 있습니다. 이름·전화번호·주소 등 개인 정보나 다른 사람의 목소리는 올리지 마세요. 업로드 후에는 직접 삭제할 수 없습니다.',
      unsupported:'이 브라우저에서는 녹음을 지원하지 않아요.', micDenied:'마이크 권한을 허용한 뒤 다시 눌러주세요.', noAudio:'녹음된 소리가 없어요. 다시 시도해 주세요.', tooLarge:'파일 크기가 제한을 넘었어요. 짧게 다시 녹음해 주세요.', uploading:'소리를 놓는 중…', uploadFail:'업로드에 실패했어요. 연결이나 파일 형식을 확인해 주세요.', uploadSuccess:'익명으로 소리를 남겼어요.', clipArrived:'새로운 소리가 소리함에 도착했어요.',
      art:'작은 목소리가<br>멀리 여행해요', step1:'언어를 선택해요', step2:'랜덤 소리를 들어요', step3:'마음에 남는 순간을 만나요',
      playerNote:'소리는 여러 언어로 남겨질 수 있어요. 화면의 안내만 번역됩니다.', closing:'짧은 소리 하나가<br>멀리 건너가 닿기를.', closingNote:'화면의 안내 문구를 6개 언어로 볼 수 있어요.',
      footer:'소리함 © 2026', tagline:'짧은 소리, 조용한 연결', report:'신고', reportTitle:'이 소리 신고하기', reportHeading:'어떤 점이 불편했나요?', close:'닫기',
      reasonBad:'부적절한 내용', reasonPrivate:'개인 정보가 포함됨', reasonOther:'기타', submitReport:'신고 보내기', reportFail:'신고를 보내지 못했어요.', reportSuccess:'신고를 접수했어요. 알려줘서 고마워요.'
    },
    en: {
      brand:'Sound Box', privacy:'Anonymous, by design', title:'Sound Box — a small voice today', description:'An anonymous sound box for leaving a moment and finding someone else’s voice.',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'Instead of words,', line2:'meet a voice.', intro1:'A sigh, a small laugh, or five seconds of silence.', intro2:'Chance upon a moment someone left behind.',
      listen:'Hear a random sound', write:'Leave a sound', ready:'The sound box is open. Listen to someone’s voice.', noConfig:'Could not load the connection settings.', loading:'Finding a sound…', empty:'No voices have arrived yet. Please come back later.', newClip:'You found a new voice.', fetchError:'Could not load a sound. Please try again shortly.', connectionError:'Please check the Supabase connection.', clipLabel:'A voice, {seconds} sec',
      recordEyebrow:'LEAVE A SOUND', recordTitle:'Leave a little<br>sound today?', recordAside:'Sometimes a small sound<br>says more than words.', recordHint:'Press the microphone and capture a sound.', recordCaption:'Tap to record · up to 5 seconds', recordStart:'Start recording', recordStop:'Stop recording', recording:'Recording now. Tap again when you’re done.', preview:'Listen before you share it.', upload:'Share anonymously', discard:'Record again', finePrint:'Recordings can be up to 5 seconds. Uploaded sounds are public. Do not include names, contact details, addresses, or another person’s voice. You cannot delete a sound after uploading it.',
      unsupported:'Recording is not supported in this browser.', micDenied:'Allow microphone access, then try again.', noAudio:'No sound was recorded. Please try again.', tooLarge:'The file is too large. Please record a shorter sound.', uploading:'Leaving your sound…', uploadFail:'Upload failed. Check your connection and audio format.', uploadSuccess:'Your sound was shared anonymously.', clipArrived:'A new sound has arrived.',
      art:'a little voice<br>travels far', step1:'Choose a language', step2:'Hear a random voice', step3:'Find a moment that stays with you',
      playerNote:'Voices may be in any language. Only the interface is translated.', closing:'May one small sound<br>travel far and find you.', closingNote:'Interface text is available in six languages.',
      footer:'Sound Box © 2026', tagline:'Small sounds, quiet connections', report:'Report', reportTitle:'Report this sound', reportHeading:'What made you uncomfortable?', close:'Close',
      reasonBad:'Inappropriate content', reasonPrivate:'Personal information', reasonOther:'Other', submitReport:'Send report', reportFail:'Could not send the report.', reportSuccess:'Report received. Thank you for letting us know.'
    },
    ja: {
      brand:'サウンドボックス', privacy:'名前を出さず、気軽に', title:'サウンドボックス — 今日の小さな声', description:'名前を出さずに音を残し、誰かの声に出会う場所。',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'言葉のかわりに、', line2:'声に出会おう。', intro1:'ため息、小さな笑い声、あるいは何も言わない5秒。', intro2:'誰かが残した瞬間に、偶然出会ってみてください。',
      listen:'ランダムな音を聴く', write:'音を残す', ready:'ボックスが開きました。誰かの声を聴いてみましょう。', noConfig:'接続設定を読み込めませんでした。', loading:'音を探しています…', empty:'まだ音は届いていません。また後で来てください。', newClip:'新しい声に出会いました。', fetchError:'音を読み込めませんでした。少ししてから再試行してください。', connectionError:'Supabaseの接続を確認してください。', clipLabel:'誰かの{seconds}秒の声',
      recordEyebrow:'音を残す', recordTitle:'今日の音を<br>残しませんか？', recordAside:'短い音が、ときには<br>長い言葉より伝わります。', recordHint:'マイクを押して、今の音を録音しましょう。', recordCaption:'タップして録音 · 最大5秒', recordStart:'録音開始', recordStop:'録音停止', recording:'録音中です。もう一度押すと終了します。', preview:'投稿前に録音を確認してください。', upload:'匿名で投稿', discard:'録り直す', finePrint:'録音は最大5秒です。投稿した音は誰でも聴けます。名前、連絡先、住所、他人の声を入れないでください。投稿後は自分で削除できません。',
      unsupported:'このブラウザでは録音できません。', micDenied:'マイクへのアクセスを許可して、もう一度お試しください。', noAudio:'音声が録音されませんでした。もう一度お試しください。', tooLarge:'ファイルが大きすぎます。短く録音し直してください。', uploading:'音を投稿しています…', uploadFail:'投稿に失敗しました。接続と音声形式を確認してください。', uploadSuccess:'音を匿名で投稿しました。', clipArrived:'新しい音が届きました。',
      art:'小さな声が<br>遠くへ旅する', step1:'言語を選ぶ', step2:'ランダムな声を聴く', step3:'心に残る瞬間に出会う',
      playerNote:'音声はさまざまな言語で投稿されます。翻訳されるのは画面の案内だけです。', closing:'小さな音が<br>遠くまで届きますように。', closingNote:'画面の案内は6言語で表示できます。',
      footer:'サウンドボックス © 2026', tagline:'小さな音、静かなつながり', report:'報告', reportTitle:'この音声を報告', reportHeading:'どのような点が気になりましたか？', close:'閉じる',
      reasonBad:'不適切な内容', reasonPrivate:'個人情報が含まれている', reasonOther:'その他', submitReport:'報告を送信', reportFail:'報告を送信できませんでした。', reportSuccess:'報告を受け付けました。お知らせいただきありがとうございます。'
    },
    zh: {
      brand:'声音盒', privacy:'匿名聆听，轻松分享', title:'声音盒 — 今日的一段小声音', description:'匿名留下声音，偶然听见另一个人的声音。',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'不必说很多，', line2:'来听见彼此。', intro1:'一声叹息、一点笑意，或安静的五秒。', intro2:'偶然遇见某个人留下的片刻。',
      listen:'随机听一段声音', write:'留下声音', ready:'声音盒已打开，来听听别人的声音吧。', noConfig:'无法读取连接设置。', loading:'正在寻找声音…', empty:'还没有声音送达，请稍后再来。', newClip:'你遇见了一段新声音。', fetchError:'无法加载声音，请稍后重试。', connectionError:'请检查 Supabase 连接。', clipLabel:'一段{seconds}秒的声音',
      recordEyebrow:'留下声音', recordTitle:'留下今天的<br>一小段声音？', recordAside:'有时，一小段声音<br>胜过许多言语。', recordHint:'按下麦克风，录下此刻的声音。', recordCaption:'点击录音 · 最长5秒', recordStart:'开始录音', recordStop:'停止录音', recording:'正在录音，再按一次即可结束。', preview:'上传前请先试听。', upload:'匿名上传', discard:'重新录音', finePrint:'录音最长5秒。上传的声音任何人都可以收听。请勿包含姓名、联系方式、地址或他人的声音。上传后无法自行删除。',
      unsupported:'此浏览器不支持录音。', micDenied:'请允许使用麦克风后重试。', noAudio:'没有录到声音，请重试。', tooLarge:'文件过大，请录制更短的声音。', uploading:'正在上传声音…', uploadFail:'上传失败，请检查网络和音频格式。', uploadSuccess:'已匿名分享声音。', clipArrived:'有新的声音送达。',
      art:'一段小小的声音<br>也能传得很远', step1:'选择语言', step2:'随机听一段声音', step3:'遇见留在心里的片刻',
      playerNote:'声音可能使用不同语言。这里只翻译界面文字。', closing:'愿一段小小的声音<br>越过距离，来到你身边。', closingNote:'界面文字支持六种语言。',
      footer:'声音盒 © 2026', tagline:'细小声音，安静连接', report:'举报', reportTitle:'举报这段声音', reportHeading:'这段声音哪里让你感到不适？', close:'关闭',
      reasonBad:'不当内容', reasonPrivate:'包含个人信息', reasonOther:'其他', submitReport:'提交举报', reportFail:'举报未能发送。', reportSuccess:'已收到举报，谢谢你的提醒。'
    },
    es: {
      brand:'Caja de sonidos', privacy:'Anónimo y sin presión', title:'Caja de sonidos — una pequeña voz', description:'Un espacio anónimo para dejar un sonido y encontrar la voz de otra persona.',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'En vez de palabras,', line2:'encuentra una voz.', intro1:'Un suspiro, una risa pequeña o cinco segundos de silencio.', intro2:'Descubre por casualidad un momento que alguien dejó.',
      listen:'Escuchar un sonido al azar', write:'Dejar un sonido', ready:'La caja está abierta. Escucha la voz de alguien.', noConfig:'No se pudo cargar la configuración de conexión.', loading:'Buscando un sonido…', empty:'Aún no han llegado voces. Vuelve más tarde.', newClip:'Has encontrado una voz nueva.', fetchError:'No se pudo cargar el sonido. Inténtalo de nuevo en un momento.', connectionError:'Comprueba la conexión con Supabase.', clipLabel:'Una voz de {seconds} s',
      recordEyebrow:'DEJA UN SONIDO', recordTitle:'¿Dejas un pequeño<br>sonido de hoy?', recordAside:'A veces, un sonido breve<br>dice más que las palabras.', recordHint:'Pulsa el micrófono y graba este momento.', recordCaption:'Toca para grabar · máx. 5 segundos', recordStart:'Empezar a grabar', recordStop:'Detener grabación', recording:'Grabando. Vuelve a tocar para terminar.', preview:'Escucha antes de compartir.', upload:'Compartir anónimamente', discard:'Grabar de nuevo', finePrint:'Las grabaciones duran hasta 5 segundos. Cualquiera puede escuchar los sonidos publicados. No incluyas nombres, datos de contacto, direcciones ni la voz de otra persona. No podrás borrar el sonido después de subirlo.',
      unsupported:'Este navegador no permite grabar.', micDenied:'Permite el acceso al micrófono e inténtalo de nuevo.', noAudio:'No se grabó ningún sonido. Inténtalo otra vez.', tooLarge:'El archivo es demasiado grande. Graba un sonido más corto.', uploading:'Publicando tu sonido…', uploadFail:'No se pudo subir. Revisa la conexión y el formato de audio.', uploadSuccess:'Tu sonido se compartió de forma anónima.', clipArrived:'Ha llegado un sonido nuevo.',
      art:'una voz pequeña<br>llega muy lejos', step1:'Elige un idioma', step2:'Escucha una voz al azar', step3:'Encuentra un instante que te acompañe',
      playerNote:'Las voces pueden estar en cualquier idioma. Solo se traduce la interfaz.', closing:'Que un pequeño sonido<br>cruce la distancia y te encuentre.', closingNote:'La interfaz está disponible en seis idiomas.',
      footer:'Caja de sonidos © 2026', tagline:'Sonidos pequeños, conexiones tranquilas', report:'Denunciar', reportTitle:'Denunciar este sonido', reportHeading:'¿Qué te ha incomodado?', close:'Cerrar',
      reasonBad:'Contenido inapropiado', reasonPrivate:'Incluye datos personales', reasonOther:'Otro', submitReport:'Enviar denuncia', reportFail:'No se pudo enviar la denuncia.', reportSuccess:'Denuncia recibida. Gracias por avisarnos.'
    },
    fr: {
      brand:'Boîte à sons', privacy:'Anonyme, tout simplement', title:'Boîte à sons — une petite voix', description:'Un espace anonyme pour laisser un son et rencontrer la voix de quelqu’un.',
      eyebrow:'THE SOUND BOX · ANONYMOUS VOICES', line1:'Au lieu des mots,', line2:'rencontrez une voix.', intro1:'Un soupir, un petit rire ou cinq secondes de silence.', intro2:'Découvrez par hasard un instant laissé par quelqu’un.',
      listen:'Écouter un son au hasard', write:'Laisser un son', ready:'La boîte est ouverte. Écoutez la voix de quelqu’un.', noConfig:'Impossible de charger les paramètres de connexion.', loading:'Recherche d’un son…', empty:'Aucune voix pour le moment. Revenez un peu plus tard.', newClip:'Vous avez rencontré une nouvelle voix.', fetchError:'Impossible de charger le son. Réessayez dans un instant.', connectionError:'Vérifiez la connexion à Supabase.', clipLabel:'Une voix de {seconds} s',
      recordEyebrow:'LAISSER UN SON', recordTitle:'Laisser un petit<br>son du jour ?', recordAside:'Parfois, un son bref<br>en dit plus que les mots.', recordHint:'Appuyez sur le micro pour enregistrer cet instant.', recordCaption:'Appuyez pour enregistrer · 5 s max.', recordStart:'Démarrer l’enregistrement', recordStop:'Arrêter l’enregistrement', recording:'Enregistrement en cours. Appuyez de nouveau pour terminer.', preview:'Écoutez avant de partager.', upload:'Partager anonymement', discard:'Enregistrer à nouveau', finePrint:'Les enregistrements durent au maximum 5 secondes. Les sons publiés sont accessibles à tous. N’incluez pas de nom, coordonnées, adresse ni la voix d’une autre personne. Vous ne pourrez pas supprimer le son après son envoi.',
      unsupported:'Ce navigateur ne permet pas l’enregistrement.', micDenied:'Autorisez l’accès au micro, puis réessayez.', noAudio:'Aucun son n’a été enregistré. Réessayez.', tooLarge:'Fichier trop volumineux. Enregistrez un son plus court.', uploading:'Envoi de votre son…', uploadFail:'Échec de l’envoi. Vérifiez la connexion et le format audio.', uploadSuccess:'Votre son a été partagé anonymement.', clipArrived:'Un nouveau son est arrivé.',
      art:'une petite voix<br>voyage très loin', step1:'Choisissez une langue', step2:'Écoutez une voix au hasard', step3:'Rencontrez un instant qui vous accompagne',
      playerNote:'Les voix peuvent être dans toutes les langues. Seule l’interface est traduite.', closing:'Qu’un petit son<br>traverse la distance jusqu’à vous.', closingNote:'L’interface est disponible en six langues.',
      footer:'Boîte à sons © 2026', tagline:'Petits sons, liens tout en douceur', report:'Signaler', reportTitle:'Signaler ce son', reportHeading:'Qu’est-ce qui vous a gêné ?', close:'Fermer',
      reasonBad:'Contenu inapproprié', reasonPrivate:'Informations personnelles', reasonOther:'Autre', submitReport:'Envoyer le signalement', reportFail:'Impossible d’envoyer le signalement.', reportSuccess:'Signalement reçu. Merci de nous l’avoir indiqué.'
    }
  };

  const t = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, value),
    copy[language][key] || copy.en[key] || key
  );
  const status = (key) => { $('statusLine').textContent = t(key); };
  const toast = (key) => {
    const el = $('toast'); el.textContent = t(key); el.classList.add('show');
    clearTimeout(toastId); toastId = setTimeout(() => el.classList.remove('show'), 3200);
  };
  const setLanguage = (next) => {
    language = copy[next] ? next : 'ko';
    const strings = copy[language];
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
    document.title = strings.title;
    document.querySelector('meta[name="description"]').content = strings.description;
    $('brandText').textContent = strings.brand;
    $('privacyLabel').textContent = strings.privacy;
    $('heroEyebrow').textContent = strings.eyebrow;
    $('heroLine1').textContent = strings.line1;
    $('heroLine2').textContent = strings.line2;
    $('heroIntro1').textContent = strings.intro1;
    $('heroIntro2').textContent = strings.intro2;
    $('listenButtonText').textContent = strings.listen;
    $('writeButtonText').textContent = strings.write;
    $('artLabel').innerHTML = strings.art;
    $('recordEyebrow').textContent = strings.recordEyebrow;
    $('recordTitle').innerHTML = strings.recordTitle;
    $('recordAside').innerHTML = strings.recordAside;
    $('recordHint').textContent = strings.recordHint;
    $('recordCaption').textContent = strings.recordCaption;
    $('recordButton').setAttribute('aria-label', recorder?.state === 'recording' ? strings.recordStop : strings.recordStart);
    $('uploadButton').textContent = strings.upload;
    $('discardButton').textContent = strings.discard;
    $('finePrint').textContent = strings.finePrint;
    $('stepOne').textContent = strings.step1;
    $('stepTwo').textContent = strings.step2;
    $('stepThree').textContent = strings.step3;
    $('playerNote').textContent = strings.playerNote;
    $('closingLine').innerHTML = strings.closing;
    $('closingNote').textContent = strings.closingNote;
    $('footerBrand').textContent = strings.footer;
    $('footerTagline').textContent = strings.tagline;
    $('reportButton').textContent = strings.report;
    $('reportButton').title = strings.reportTitle;
    $('reportHeading').textContent = strings.reportHeading;
    $('reportButton').setAttribute('aria-label', strings.reportTitle);
    $('dialogClose').setAttribute('aria-label', strings.close);
    $('reasonInappropriate').textContent = strings.reasonBad;
    $('reasonPersonal').textContent = strings.reasonPrivate;
    $('reasonOther').textContent = strings.reasonOther;
    $('submitReportButton').textContent = strings.submitReport;
    if ($('playerCard').hidden) status(client ? 'ready' : 'noConfig');
    else if ($('clipLabel').dataset.seconds) $('clipLabel').textContent = t('clipLabel', { seconds: $('clipLabel').dataset.seconds });
    localStorage.setItem('soundbox-language', language);
  };

  const savedLanguage = localStorage.getItem('soundbox-language');
  $('languageSelect').value = copy[savedLanguage] ? savedLanguage : 'ko';
  $('languageSelect').addEventListener('change', (event) => setLanguage(event.target.value));
  setLanguage($('languageSelect').value);

  const formatTime = (value) => `00:0${Math.min(5, value)} <span>/ 00:05</span>`;
  const resetRecorder = () => {
    clearInterval(timerId);
    timerId = null;
    $('recordButton').classList.remove('recording');
    $('micVisual').classList.remove('active');
    $('recordButton').setAttribute('aria-label', copy[language].recordStart);
  };
  $('writeButton').addEventListener('click', () => $('recordSection').scrollIntoView({ behavior: 'smooth' }));
  $('recordButton').addEventListener('click', async () => {
    if (recorder?.state === 'recording') { recorder.stop(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('unsupported');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks = [];
      seconds = 0;
      startedAt = Date.now();
      $('timer').innerHTML = formatTime(0);
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        seconds = Math.max(1, Math.min(5, Math.ceil((Date.now() - startedAt) / 1000)));
        currentBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        resetRecorder();
        if (!currentBlob.size) { $('recordHint').textContent = copy[language].recordHint; return toast('noAudio'); }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = URL.createObjectURL(currentBlob);
        $('previewPlayer').src = previewUrl;
        $('previewArea').hidden = false;
        $('recordHint').textContent = copy[language].preview;
      };
      recorder.start();
      $('recordButton').classList.add('recording');
      $('micVisual').classList.add('active');
      $('recordButton').setAttribute('aria-label', copy[language].recordStop);
      $('recordHint').textContent = copy[language].recording;
      timerId = setInterval(() => {
        seconds = Math.min(5, Math.floor((Date.now() - startedAt) / 1000));
        $('timer').innerHTML = formatTime(seconds);
        if (Date.now() - startedAt >= 5000 && recorder?.state === 'recording') recorder.stop();
      }, 100);
    } catch (error) {
      console.error(error);
      toast(error?.name === 'NotAllowedError' ? 'micDenied' : 'unsupported');
    }
  });
  $('discardButton').addEventListener('click', () => {
    currentBlob = null;
    $('previewPlayer').pause();
    $('previewPlayer').removeAttribute('src');
    $('previewArea').hidden = true;
    $('recordHint').textContent = copy[language].recordHint;
    $('timer').innerHTML = formatTime(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  });
  $('uploadButton').addEventListener('click', async () => {
    if (!client || !currentBlob) return toast('connectionError');
    if (currentBlob.size > 1_500_000) return toast('tooLarge');
    $('uploadButton').disabled = true;
    $('uploadButton').textContent = copy[language].uploading;
    const ext = currentBlob.type.includes('mp4') ? 'mp4' : currentBlob.type.includes('ogg') ? 'ogg' : 'webm';
    const path = `${crypto.randomUUID()}.${ext}`;
    try {
      const { error: uploadError } = await client.storage.from(bucket).upload(path, currentBlob, { contentType: currentBlob.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: rowError } = await client.from('soundbox_clips').insert({ object_path: path, duration_seconds: Math.max(1, seconds || 1) });
      if (rowError) throw rowError;
      currentBlob = null;
      $('previewArea').hidden = true;
      $('previewPlayer').pause();
      $('previewPlayer').removeAttribute('src');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = null;
      $('recordHint').textContent = copy[language].uploadSuccess;
      $('timer').innerHTML = formatTime(0);
      status('clipArrived');
      toast('uploadSuccess');
    } catch (error) {
      console.error(error);
      toast('uploadFail');
    } finally {
      $('uploadButton').disabled = false;
      $('uploadButton').textContent = copy[language].upload;
    }
  });

  $('listenButton').addEventListener('click', async () => {
    if (!client) return toast('connectionError');
    $('listenButton').disabled = true;
    status('loading');
    try {
      const { data, error } = await client.from('soundbox_clips')
        .select('id, object_path, duration_seconds, created_at')
        .order('created_at', { ascending: false }).limit(40);
      if (error) throw error;
      if (!data?.length) { status('ready'); toast('empty'); return; }
      const clip = data[Math.floor(Math.random() * data.length)];
      const { data: file } = client.storage.from(bucket).getPublicUrl(clip.object_path);
      currentClipId = clip.id;
      $('audioPlayer').src = file.publicUrl;
      $('clipLabel').dataset.seconds = clip.duration_seconds;
      $('clipLabel').textContent = t('clipLabel', { seconds: clip.duration_seconds });
      $('playerCard').hidden = false;
      $('audioPlayer').play().catch(() => {});
      $('playerCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
      status('newClip');
    } catch (error) {
      console.error(error); status('ready'); toast('fetchError');
    } finally { $('listenButton').disabled = false; }
  });

  $('reportButton').addEventListener('click', () => $('reportDialog').showModal());
  $('submitReportButton').addEventListener('click', async (event) => {
    event.preventDefault();
    if (!client || !currentClipId) return;
    const reason = document.querySelector('input[name="reason"]:checked').value;
    const { error } = await client.from('soundbox_reports').insert({ clip_id: currentClipId, reason });
    $('reportDialog').close();
    toast(error ? 'reportFail' : 'reportSuccess');
  });
})();


