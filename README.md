# 소리함 (The Sound Box)

익명으로 최대 5초의 소리를 남기고, 다른 사람이 남긴 소리를 랜덤으로 듣는 정적 웹앱입니다. Supabase Storage와 Postgres를 사용하며 로그인 없이 동작하도록 구성했습니다.

## 실행

`index.html`을 HTTPS 정적 호스팅에 배포하면 됩니다. 마이크 녹음은 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작할 수 있습니다. Supabase URL과 publishable key는 `config.js`에 설정돼 있습니다. 브라우저용 publishable key만 포함하고, secret/service role key는 포함하지 않습니다.

## Supabase

`supabase/migrations/202611100001_soundbox_public_audio.sql`은 `soundbox_clips` 및 `soundbox_reports` 테이블, 공개 오디오 버킷, RLS 정책을 생성합니다. 현재 앱 프로젝트에 이 마이그레이션을 적용했습니다.

오디오와 익명 게시물은 공개적으로 재생됩니다. 신고는 접수되지만 이 데모에는 관리자 검토 화면, 자동 삭제, 속도 제한이 없습니다. 실제 공개 운영 전에는 업로드 제한과 남용 방지, 신고 검토·삭제 절차를 추가해야 합니다. 사용자는 식별 정보나 타인의 동의 없는 목소리를 올리지 않도록 안내받습니다.

## GitHub Pages

GitHub 저장소의 Pages 설정에서 GitHub Actions 배포를 활성화하면 정적 사이트로 배포할 수 있습니다. 녹음은 HTTPS 환경에서 동작합니다.

