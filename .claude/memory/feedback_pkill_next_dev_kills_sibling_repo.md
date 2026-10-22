---
name: feedback_pkill_next_dev_kills_sibling_repo
description: "pkill -f \"next dev\"\"는 gospelfix와 gospelfix.cms.api 양쪽 dev 서버를 둘 다 죽인다 — 테스트용 서버만 정리하려다 세션 이전부터 떠 있던 형제 저장소 서버까지 종료시킨 사례"
metadata:
  type: feedback
---

`gospelfix`와 `gospelfix.cms.api`는 둘 다 Next.js 프로젝트라 프로세스 커맨드라인이
각각 `next dev`, `next dev --port 3001`로 둘 다 `"next dev"` 문자열을 포함한다.
테스트가 끝난 뒤 이번 세션에서 직접 띄운 임시 dev 서버만 정리하려고
`pkill -f "next dev"`를 실행했는데, 패턴 매칭이 포트를 구분하지 못해서 **이 세션
시작 전부터 이미 떠 있던 `gospelfix.cms.api`(포트 3001) 서버까지 함께 종료**돼버렸다.

**Why:** `pkill -f`는 전체 커맨드라인 문자열에 패턴이 포함되기만 하면 매칭되므로, 포트
번호 등 구분자가 패턴에 없으면 형제 저장소의 무관한 프로세스까지 같이 죽는다. 이
프로젝트는 폴리레포라 두 Next.js 서버가 동시에 떠 있는 게 정상 상태이고, 한쪽(cms.api)은
내가 띄운 게 아니라 사용자/이전 세션이 이미 띄워둔 것일 수 있다 — 그런 서버를 실수로
죽이는 건 "내가 만든 임시 자원만 정리"하려던 의도를 벗어난 부작용이다.

**How to apply:** 여러 Next.js 저장소를 오가며 임시 dev 서버를 띄우고 정리할 때는
`pkill -f "next dev"`처럼 느슨한 패턴을 쓰지 말고, (1) 띄울 때 받은 PID를 기억해뒀다가
`kill <PID>`로 정확히 지정하거나, (2) `lsof -i :<포트>`로 PID를 먼저 조회해서 그 PID만
죽일 것. 실수로 형제 서버까지 죽였다면 즉시 같은 방식(`cd <repo> && (yarn dev > <로그>
2>&1 &)`)으로 재기동하고 `lsof -i :<포트>`로 복구를 확인한다. 관련:
[[feedback_multi_repo_bash_cwd_caution]](cwd 혼동), 이 메모리는 프로세스 종료 패턴
혼동에 대한 것으로 별개 함정이다.
