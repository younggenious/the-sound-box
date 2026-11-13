# 소리함 (The Sound Box)

최대 5초 소리를 녹음해 익명으로 올리거나, 다른 사람이 남긴 소리를 랜덤으로 들을 수 있는 정적 웹사이트입니다. 한국어, 영어, 일본어, 중국어(간체), 스페인어, 프랑스어 화면을 지원합니다.

## 실행

`index.html`을 HTTPS 정적 호스팅에 배포하면 됩니다. 마이크 녹음은 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작할 수 있습니다. Supabase URL과 publishable key는 `config.js`에 설정돼 있습니다. 브라우저용 publishable key만 포함하고, secret/service role key는 포함하지 않습니다.

## Supabase

`supabase/migrations/202611100001_soundbox_public_audio.sql`은 `soundbox_clips` 및 `soundbox_reports` 테이블, 공개 오디오 버킷, RLS 정책을 생성합니다. `supabase/migrations/202611120001_disable_public_soundbox_uploads.sql`에서 닫았던 익명 업로드 권한은 `supabase/migrations/202611130001_restore_public_soundbox_uploads.sql`에서 다시 열었습니다. 공개 업로드는 익명 사용자가 오디오 파일을 Storage에 추가하고, 1~5초 메타데이터를 `soundbox_clips`에 추가할 수 있도록 제한됩니다.

올린 오디오는 공개 재생되며 신고도 접수됩니다. 녹음은 HTTPS에서 마이크 권한을 허용해야 합니다. 개인 정보나 다른 사람의 음성이 포함된 녹음을 올리지 않도록 안내합니다. 신고는 접수되지만 이 데모에는 관리자 검토 화면, 자동 삭제, 속도 제한이 없습니다.

## GitHub Pages

GitHub 저장소의 Pages 설정에서 GitHub Actions 배포를 활성화하면 정적 사이트로 배포할 수 있습니다. 녹음은 HTTPS 환경에서 동작합니다.

