export const DIALOG_TEXT = {
    GREETING_DEFAULT: "어서오세요!",
    GREETING_USER: (name) => `어서오세요, ${name}님!`,
    ASK_HELP: "무엇을 도와드릴까요?",
    DIET_REDIRECT: "식단 기록 페이지로 이동할게요!",
    WORKOUT_REDIRECT: "운동 기록 페이지로 이동할게요!",
    RUNNING_REDIRECT: "러닝 기록 페이지로 이동할게요!",
    THINKING: "그래, 천천히 생각해봐. 언제든 기다릴게.",
}

export const DIALOG_CHOICES = [
    { id: 1, text: "오늘 먹은 식단 기록할래" },
    { id: 2, text: "운동 기록하러 왔어" },
    { id: 3, text: "러닝 기록하러 왔어" },
    { id: 4, text: "지금은 좀 더 생각해봐야할 거 같아" }
]
