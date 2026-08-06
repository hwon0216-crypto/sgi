[사진 자동 등록 사용법 - Windows]

1. 사진 넣기
   photos/day1 : 8월 20일 사진
   photos/day2 : 8월 21일 사진
   photos/day3 : 8월 22일 사진
   photos/day4 : 8월 23일 사진
   photos/day5 : 8월 24일 사진

   파일명은 1.jpg, 2.jpg ... 또는 IMG_1234.jpg처럼 자유롭게 사용해도 됩니다.
   숫자가 들어간 파일명은 1, 2, 3 ... 순으로 자연 정렬됩니다.

2. 자동 변환
   사진변환.bat를 더블클릭합니다.
   처음 실행할 때 Pillow가 없으면 자동 설치합니다.

   자동 생성 결과
   - assets/gallery/day1~day5/thumbs : 작은 WebP 썸네일
   - assets/gallery/day1~day5/full   : 클릭 시 표시할 확대용 JPEG
   - gallery-data.js                 : 사이트가 읽는 사진 목록

3. 사이트 확인
   index.html을 열어 확인합니다.
   사진은 3열 정사각형 격자로 표시되고 클릭하면 확대 및 좌우 스와이프가 됩니다.

4. 네이버 MYBOX 링크 입력
   mybox-links.js를 메모장으로 열고 따옴표 안에 공유 링크를 넣습니다.

   예시
   window.MYBOX_LINKS = {
     day1: "https://mybox.naver.com/공유주소1",
     day2: "https://mybox.naver.com/공유주소2",
     day3: "https://mybox.naver.com/공유주소3",
     day4: "https://mybox.naver.com/공유주소4",
     day5: "https://mybox.naver.com/공유주소5",
     all: "https://mybox.naver.com/전체사진공유주소"
   };

   링크가 빈 날짜의 버튼은 자동으로 숨겨집니다.
   all은 페이지 맨 아래 '전체 사진 보기' 버튼용이며 비워도 됩니다.

5. GitHub 업로드
   변환 후 사이트 폴더 전체를 GitHub 저장소에 업로드합니다.
   특히 assets/gallery와 gallery-data.js가 빠지지 않게 올려야 합니다.

[데이터 절약 방식]
- 목록에서는 작은 썸네일만 지연 로딩합니다.
- 사진을 누를 때 해당 확대용 사진 한 장만 불러옵니다.
- 확대용 사진은 긴 변 최대 2000px, 썸네일은 최대 480px로 자동 최적화됩니다.
- 원본 전체는 사이트에 올리지 않아도 됩니다. 원본은 MYBOX에서 제공합니다.

[사진 변경 시]
photos/day1~day5 안의 사진을 교체한 뒤 사진변환.bat를 다시 실행하고,
변경된 assets/gallery와 gallery-data.js를 GitHub에 다시 업로드하면 됩니다.
