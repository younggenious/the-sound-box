# 소리함 (The Sound Box)

다른 사람이 남긴 짧은 소리를 랜덤으로 듣는 정적 웹사이트입니다. 한국어, 영어, 일본어, 중국어(간체), 스페인어, 프랑스어 화면을 지원합니다. 녹음 및 업로드 기능은 제공하지 않습니다.

## 실행

`index.html`을 HTTPS 정적 호스팅에 배포하면 됩니다. 마이크 녹음은 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작할 수 있습니다. Supabase URL과 publishable key는 `config.js`에 설정돼 있습니다. 브라우저용 publishable key만 포함하고, secret/service role key는 포함하지 않습니다.

## Supabase

`supabase/migrations/202611100001_soundbox_public_audio.sql`은 `soundbox_clips` 및 `soundbox_reports` 테이블, 공개 오디오 버킷, RLS 정책을 생성합니다. `supabase/migrations/202611120001_disable_public_soundbox_uploads.sql`은 익명 오디오 업로드 권한을 닫습니다. 두 마이그레이션은 현재 앱 프로젝트에 적용했습니다.

기존 오디오는 공개 재생되며 신고도 접수됩니다. 이 사이트에서 새 오디오를 녹음하거나 올릴 수 없습니다. 신고는 접수되지만 이 데모에는 관리자 검토 화면, 자동 삭제, 속도 제한이 없습니다.

## GitHub Pages

GitHub 저장소의 Pages 설정에서 GitHub Actions 배포를 활성화하면 정적 사이트로 배포할 수 있습니다. 녹음은 HTTPS 환경에서 동작합니다.

