<img src="assets/icon.svg" width="64" height="64" alt="">

# 말로 만드는 게임: 바이브코딩 웹게임 수업 자료

중학생이 생성형 AI에게 말로 설명해서 자기 웹게임을 만드는 2차시(90분) 수업 자료입니다. 코딩을 몰라도 따라올 수 있게 만들었습니다.

**온라인으로 보기:** https://gunggme.github.io/yangsan-girl-middleschool/

PDF: [슬라이드](pdf/slides.pdf) · [활동지](pdf/worksheet.pdf) · [교사용 지도안](pdf/teacher-guide.pdf)

| 파일 | 내용 |
|---|---|
| [`slides/index.html`](slides/index.html) | 수업 슬라이드 27장 (← → 이동, F 전체화면) |
| [`worksheet.html`](worksheet.html) | 학생 활동지 (A4 2쪽, 인쇄용) |
| [`teacher-guide.md`](teacher-guide.md) | 교사용 지도안: 수업 흐름, 사전 확인, 지도할 때 참고할 점, 문제 해결, 평가 기준. `teacher-guide.html`은 이 파일에서 만들어집니다 |
| [`examples/morning-dash.html`](examples/morning-dash.html) | 시연용 예시 게임 "등굣길 대작전" (스테이지 3개짜리 달리기 게임) |
| [`assets/fonts/`](assets/fonts) | Pretendard 글꼴과 라이선스 |

설치나 인터넷 연결 없이 브라우저로 바로 열립니다. 각 HTML에 글꼴이 들어 있고 슬라이드에는 예시 게임도 들어 있어서, 파일 하나만 따로 열어도 그대로 보입니다.

## 고친 뒤에

글을 고치거나 `examples/morning-dash.html`, `teacher-guide.md`를 고친 뒤에는 아래를 실행해 주세요. (Bun, uv, Chrome이 필요합니다.)

```bash
bun install
bun run build   # 글꼴을 다시 넣고, 지도안 HTML과 슬라이드 7번의 게임을 새로 만듭니다
bun run pdf     # pdf/ 폴더의 PDF를 다시 만듭니다
```

`master` 브랜치에 올리면 GitHub Pages에 바로 반영됩니다.

글꼴: [Pretendard](https://github.com/orioncactus/pretendard) by 길형진, SIL Open Font License 1.1.

Created in [OmO](https://omo.dev).
