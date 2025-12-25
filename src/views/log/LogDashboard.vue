<script setup>
import { computed, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { useLogStore } from '@/stores/logStore'
import { storeToRefs } from 'pinia'
import { npcApi } from '@/api/npcApi'
import AiAnalysisReportModal from '@/components/AiAnalysisReportModal.vue'

// Chart.js 컴포넌트 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const props = defineProps({
    activeTab: {
        type: String,
        default: 'diet' // 'diet' | 'workout' | 'running'
    }
})

import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const logStore = useLogStore()
const { workoutLogs, muscleExercises, monthlyTotalCaloriesIntake, monthlyTotalNutrients, dietDaysCount } = storeToRefs(logStore)

// --- 공통: 동적 타이틀 ---
const dashboardTitle = computed(() => {
    if (props.activeTab === 'diet') return '월간 식단 데이터 분석'
    if (props.activeTab === 'workout') return '월간 근력 데이터 분석'
    return '월간 유산소 데이터 분석'
})

// --- AI 분석 리포트 모달 ---
const showAiReportModal = ref(false)
const aiReportContent = ref('')
const isAiReportLoading = ref(false)

// activeTab에 따른 NPC ID 매핑
const currentNpcId = computed(() => {
    if (props.activeTab === 'diet') return 1 // 토마
    if (props.activeTab === 'workout') return 2 // 벨
    return 3 // 치에
})

const requestAiAnalysis = async () => {
    showAiReportModal.value = true
    isAiReportLoading.value = true
    aiReportContent.value = ''
    
    try {
        const now = new Date()
        const response = await npcApi.createReport({
            npcId: currentNpcId.value,
            year: now.getFullYear(),
            month: now.getMonth() + 1
        })
        aiReportContent.value = response.data || ''
    } catch (err) {
        console.error('AI 분석 실패:', err)
        aiReportContent.value = '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    } finally {
        isAiReportLoading.value = false
    }
}

const closeAiReportModal = () => {
    showAiReportModal.value = false
}

const titleColorClass = computed(() => {
    if (props.activeTab === 'diet') return 'border-pastel-red text-pastel-red'
    if (props.activeTab === 'workout') return 'border-pastel-blue text-pastel-blue'
    return 'border-pastel-yellow text-pastel-yellow'
})

// --- 데이터 분석 (Gender Based Statistics) ---
const STATS_STANDARDS = {
    MALE: {
        MEAN_CALORIES: 2295.8,
        STD_DEV: 150, // 분포 넓힘 (시작점 ~1850)
        CARB: 330,
        PROTEIN: 100,
        FAT: 75,
        SUGAR: 60
    },
    FEMALE: {
        MEAN_CALORIES: 1704.86,
        STD_DEV: 120, // 분포 넓힘
        CARB: 260,
        PROTEIN: 75,
        FAT: 60,
        SUGAR: 50
    }
}

// 사용자 성별 기준 (기본값: 남성)
const userGender = computed(() => authStore.user?.gender === 'FEMALE' ? 'FEMALE' : 'MALE')
const currentStandard = computed(() => STATS_STANDARDS[userGender.value])

// 실제 나의 일일 평균 섭취량 계산
// (기록한 날짜 수로 나눔, 0일이면 0)
const myDailyAvgCalories = computed(() => {
    const days = dietDaysCount?.value || 1
    const total = monthlyTotalCaloriesIntake?.value || 0
    return Math.round(total / days)
})

const myDailyAvgNutrients = computed(() => {
    const days = dietDaysCount?.value || 1
    const total = monthlyTotalNutrients?.value || { carbohydrate: 0, protein: 0, fat: 0, sugar: 0 }
    return {
        carbohydrate: Math.round((total.carbohydrate || 0) / days),
        protein: Math.round((total.protein || 0) / days),
        fat: Math.round((total.fat || 0) / days),
        sugar: Math.round((total.sugar || 0) / days)
    }
})

// 정규분포 데이터 생성 함수
const generateBellCurveData = (mean, stdDev) => {
  const dataPoints = []
  const labels = []
  // 해상도를 높여서(더 작은 step) 곡선을 부드럽게 하고 포인트 매칭 정확도 향상
  const step = stdDev / 4 
  const min = Math.max(0, mean - 3 * stdDev) // 음수 방지 & 범위 조정 (3표준편차)
  const max = mean + 3 * stdDev

  for (let x = min; x <= max; x += step) {
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2)
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
    dataPoints.push({ x: Math.round(x), y })
  }
  return { dataPoints } // labels 불필요
}

// 식단 정규분포 데이터 (성별 기준 동적 생성)
const dietBellCurve = computed(() => {
    if (!currentStandard.value) return { dataPoints: [] }
    return generateBellCurveData(currentStandard.value.MEAN_CALORIES, currentStandard.value.STD_DEV)
})

// =======================
// [식단] 관련 데이터
// =======================
// 1. 월간 칼로리 추이 (Line Chart)
// * 실제 일자별 데이터가 필요하지만, 현재 monthlyTotalCaloriesIntake만 있으므로 
//   Trend Chart는 일단 '평균'과 '권장'을 비교하는 형태로 가정하거나, 추후 API 보강 필요.
//   여기서는 Mock 대신 '내 평균' 라인으로 표시.
// 1. 월간 칼로리 추이 (Line Chart) -> 최근 4주 주별 평균
const trendChartData = computed(() => {
    const mean = currentStandard.value?.MEAN_CALORIES || 2000
    const stats = logStore.dailyDietStats || {}
    const today = new Date()
    
    // 4주치 주별 데이터 계산 (가장 최근 주가 마지막에 오도록)
    // Week 4 (Latest), Week 3, Week 2, Week 1 (Oldest) -> Chart displays Oldest -> Latest
    
    const weeklyAverages = []
    const labels = ['4주 전', '3주 전', '지난주', '이번주'] // or ['1주차', '2주차'...] but relative is better

    for (let w = 3; w >= 0; w--) { // 3(4주전) ~ 0(이번주)
        let sum = 0
        let count = 0
        // 각 주: w*7일 전 ~ (w+1)*7-1일 전 (역순 아님. today 기준 과거로)
        // 이번주(w=0): 0일전 ~ 6일전
        // 지난주(w=1): 7일전 ~ 13일전
        // ...
        for (let d = 0; d < 7; d++) {
            const dayOffset = (w * 7) + d
            const targetDate = new Date(today)
            targetDate.setDate(today.getDate() - dayOffset)
            
            // Local Date String (YYYY-MM-DD)
            const year = targetDate.getFullYear()
            const month = String(targetDate.getMonth() + 1).padStart(2, '0')
            const day = String(targetDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            const val = stats[dateStr]
            if (val !== undefined) {
                sum += val
                count++
            }
        }
        // 데이터가 없는 날은 0으로 취급하여 '평균'? 아니면 기록된 날만 평균?
        // "월간 섭취 추이" -> 보통 총 섭취량보다는 일일 평균 섭취가 의미 있음.
        // 기록 안 한 날을 0으로 치면 평균이 확 떨어짐. 
        // -> 사용자가 꾸준히 기록한다고 가정하고 7로 나누거나, 기록된 날짜 수로 나눔.
        // 여기선 "섭취량" 추이이므로 0인 날도 포함해서(즉 7일 평균) 보는 게 '이번 주 섭취 수준'을 보기에 적합할 수 있음.
        // 하지만 기록을 안 한 것일 수도 있으므로, count가 0이면 0. count > 0 이면 sum / count?
        // -> 보통 다이어트 앱은 7로 나누기보다 입력한 날의 평균을 보여주는 게 덜 억울함. 
        // 하지만 "월간 섭취(총량)"이 아니라 "추이"니까.. 
        // 사용자 요청: "일주일의 평균으로 해야해" 
        // -> 입력된 날만 평균 내는 게 안전함. (하나도 입력 안했으면 0)
        
        weeklyAverages.push(count > 0 ? Math.round(sum / count) : 0) // 오래된 주부터 계산하므로 push
    }

    return {
      labels: labels, 
      datasets: [
        {
          label: '주간 일일 평균 섭취',
          backgroundColor: '#ff6b8a',
          borderColor: '#ff6b8a',
          data: weeklyAverages,
          tension: 0.4,
          fill: false
        },
        {
           label: '권장 섭취',
           borderColor: '#aeb6bf',
           borderDash: [5, 5],
           data: Array(4).fill(mean),
           pointRadius: 0
        }
      ]
    }
});

// 2. 탄단지 비율 (Doughnut Chart)
const macroChartData = computed(() => {
    const { carbohydrate, protein, fat } = myDailyAvgNutrients.value
    // 데이터가 없으면 기본값 표시
    const data = (carbohydrate + protein + fat) > 0 ? [carbohydrate, protein, fat] : [5, 3, 2]
    
    return {
        labels: ['탄수화물', '단백질', '지방'],
        datasets: [
            {
            backgroundColor: ['#ff9f43', '#54a0ff', '#ff6b8a'],
            data: data
            }
        ]
    }
});

// 3. 정규분포표 (식단)
// Math.erf 구현 (근사) - 로컬 함수로 정의
const erf = (x) => {
  var t = 1.0 / (1.0 + 0.5 * Math.abs(x));
  var tau = t * Math.exp(-x*x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * (0.17087277))))))))));
  return x >= 0 ? 1 - tau : tau - 1;
}

// 통계적 위치 계산 (z-score -> percentile)
const dietStats = computed(() => {
    const mean = currentStandard.value?.MEAN_CALORIES || 2000
    const std = currentStandard.value?.STD_DEV || 300
    const myVal = myDailyAvgCalories?.value || 0

    const zScore = (myVal - mean) / std
    // 상위 % 계산 (1 - cdf) * 100
    // erf로 cdf 구하기: 0.5 * (1 + erf(x / sqrt(2)))
    const cdf = 0.5 * (1 + erf(zScore / Math.sqrt(2)))
    const topPercent = ((1 - cdf) * 100).toFixed(2) // 소수점 2자리

    // 내 위치 Y값 (확률밀도함수)
    const yVal = (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((myVal - mean) / std, 2))
    
    return { zScore, topPercent, yVal }
})

const distributionChartData = computed(() => ({
  // labels 제거 (Linear Scale 사용)
  datasets: [
    {
      type: 'line',
      label: `${userGender.value === 'MALE' ? '남성' : '여성'} 평균 분포`,
      borderColor: '#00cec9', // Darker Teal
      backgroundColor: 'rgba(0, 206, 201, 0.2)',
      data: dietBellCurve.value.dataPoints,
      fill: true,
      pointRadius: 0,
      tension: 0.4,
      order: 2
    },
    {
      type: 'scatter',
      label: '나의 위치',
      backgroundColor: '#ff6b8a', // 붉은 점
      borderColor: '#fff',
      borderWidth: 2,
      data: [{ x: myDailyAvgCalories.value, y: dietStats.value.yVal }],
      pointRadius: 8,
      pointHoverRadius: 12,
      order: 1
    }
  ]
}));

// 식단 분석 테이블 (상태 판별 로직 추가)
const getNutrientStatus = (val, recommend) => {
    const ratio = val / recommend
    if (ratio < 0.8) return { text: '부족', color: 'text-gray-500', bg: 'bg-gray-100' }
    if (ratio > 1.2) return { text: '과다', color: 'text-red-500', bg: 'bg-red-50' }
    return { text: '적정', color: 'text-green-500', bg: 'bg-green-50' }
}

const analysisTable = computed(() => {
    const nut = myDailyAvgNutrients.value
    const std = currentStandard.value
    
    // Status 계산
    const carbSt = getNutrientStatus(nut.carbohydrate, std.CARB)
    const protSt = getNutrientStatus(nut.protein, std.PROTEIN)
    const fatSt = getNutrientStatus(nut.fat, std.FAT)
    const sugSt = getNutrientStatus(nut.sugar, std.SUGAR)
    const calSt = getNutrientStatus(myDailyAvgCalories.value, std.MEAN_CALORIES)

    return [
        { name: '탄수화물', value: `${nut.carbohydrate}g`, recommend: `${std.CARB}g`, status: carbSt.text, color: carbSt.color, bg: carbSt.bg },
        { name: '단백질', value: `${nut.protein}g`, recommend: `${std.PROTEIN}g`, status: protSt.text, color: protSt.color, bg: protSt.bg },
        { name: '지방', value: `${nut.fat}g`, recommend: `${std.FAT}g`, status: fatSt.text, color: fatSt.color, bg: fatSt.bg },
        { name: '당류', value: `${nut.sugar}g`, recommend: `${std.SUGAR}g`, status: sugSt.text, color: sugSt.color, bg: sugSt.bg },
        { name: '칼로리', value: `${myDailyAvgCalories.value}kcal`, recommend: `${Math.round(std.MEAN_CALORIES)}kcal`, status: calSt.text, color: calSt.color, bg: calSt.bg }
    ]
})

// =======================
// [근력] 관련 데이터
// =======================

// 부위별 매핑 (초기화)
const partVolume = computed(() => {
    const volumes = { '가슴': 0, '등': 0, '하체': 0, '어깨': 0, '팔': 0, '기타': 0 };
    if (!workoutLogs.value || workoutLogs.value.length === 0) return volumes;

    workoutLogs.value.forEach(log => {
        // 운동 정보 찾기
        const exercise = muscleExercises.value.find(e => e.muscleExerciseId === log.muscleExerciseId)
        if (exercise) {
            const vol = (Number(log.weight) || 0) * (Number(log.setCount) || 0) * (Number(log.repsPerSet) || 0);
            const part = exercise.part || '기타'; 
            if (volumes[part] !== undefined) volumes[part] += vol;
            else volumes['기타'] += vol;
        }
    });
    return volumes;
});

const totalVolume = computed(() => {
    return Object.values(partVolume.value).reduce((a, b) => a + b, 0);
});

const workoutDaysCount = computed(() => {
    const dates = new Set(workoutLogs.value.map(log => log.date));
    return dates.size;
});

const workoutRecordCount = computed(() => workoutLogs.value.length);

// 1. 월간 볼륨 추이 (Line Chart) -> 최근 4주 주별 총 볼륨
const volumeTrendChartData = computed(() => {
    const stats = logStore.dailyWorkoutStats || {}
    const weeklyData = []
    const labels = ['4주 전', '3주 전', '지난주', '이번주']
    const today = new Date()
    
    for (let w = 3; w >= 0; w--) {
        let sum = 0
        for (let d = 0; d < 7; d++) {
            const dayOffset = (w * 7) + d
            const targetDate = new Date(today)
            targetDate.setDate(today.getDate() - dayOffset)
            
            const year = targetDate.getFullYear()
            const month = String(targetDate.getMonth() + 1).padStart(2, '0')
            const day = String(targetDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            // 볼륨은 합산이 의미 있음 (총 운동량)
            sum += (stats[dateStr] || 0)
        }
        weeklyData.push(sum)
    }

    return {
        labels: labels,
        datasets: [{
            label: '주간 총 볼륨(kg)',
            backgroundColor: '#54a0ff',
            borderColor: '#54a0ff',
            data: weeklyData,
            tension: 0.4,
            fill: false
        }]
    }
});

// 2. 부위별 비율 (Doughnut)
const partRatioChartData = computed(() => ({
    labels: ['가슴', '등', '하체', '어깨/팔/기타'],
    datasets: [{
        backgroundColor: ['#ff9f43', '#54a0ff', '#ff6b8a', '#c8d6e5'],
        data: [
            partVolume.value['가슴'], 
            partVolume.value['등'], 
            partVolume.value['하체'], 
            partVolume.value['어깨'] + partVolume.value['팔'] + partVolume.value['기타']
        ]
    }]
}));

// 3. 근력 정규분포 (가상의 랭킹)
const volumeMean = 30000; // 월 평균 30톤
const volumeStd = 10000;
const myVolume = computed(() => totalVolume.value || 25000);
const volumeZ = (myVolume.value - volumeMean) / volumeStd;
const volumePercentile = 100 * (0.5 * (1 + erf(volumeZ / Math.sqrt(2))));
const volumeTopPercent = (100 - volumePercentile).toFixed(1);
const volumeY = (1 / (volumeStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((myVolume.value - volumeMean) / volumeStd, 2));

const { dataPoints: volData } = generateBellCurveData(volumeMean, volumeStd);

const volumeDistChartData = computed(() => ({
    datasets: [
        {
            type: 'line',
            label: '전체 사용자 분포',
            borderColor: '#74b9ff', // Darker Blue
            backgroundColor: 'rgba(116, 185, 255, 0.2)',
            data: volData,
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            order: 2
        },
        {
            type: 'scatter',
            label: '나의 위치',
            backgroundColor: '#54a0ff',
            borderColor: '#fff',
            borderWidth: 2,
            data: [{ x: myVolume.value, y: volumeY }],
            pointRadius: 8,
            pointHoverRadius: 12,
            order: 1
        }
    ]
}));


// =======================
// [유산소] 관련 데이터
// =======================

const { runningLogs, cardioExercises, monthlyTotalCaloriesBurned } = storeToRefs(logStore)

// 1. 요약 데이터 계산
const totalRunningTime = computed(() => {
    return runningLogs.value.reduce((acc, log) => acc + (Number(log.durationMinutes) || 0), 0)
})

const avgRunningIntensity = computed(() => {
    if (totalRunningTime.value === 0) return 0
    // 분당 소모 칼로리로 강도 추정
    return (monthlyTotalCaloriesBurned.value / totalRunningTime.value).toFixed(1)
})

const runningDaysCount = computed(() => {
    const dates = new Set(runningLogs.value.map(log => log.date))
    return dates.size
})

// 운동 종류별 집계
const runningTypeStats = computed(() => {
    const stats = {}
    runningLogs.value.forEach(log => {
        const name = log.exerciseName || '기타'
        if (!stats[name]) stats[name] = 0
        stats[name] += (Number(log.burnedKcal) || 0) // 비율 기준을 칼로리로 할지 시간이 좋을지... 보통 시간? 
        // -> User said "총 운동 비율". Time or Count. Let's use Time (Duration).
        // Let's assume Time for pie chart.
    })
    return stats
})

const runningTypeCount = computed(() => Object.keys(runningTypeStats.value).length)

// 2. 월간 소모 칼로리 추이 (Line Chart) -> 최근 4주 주별 총 소모량
const runningTrendChartData = computed(() => {
    const stats = logStore.dailyRunningStats || {}
    const weeklyData = []
    const labels = ['4주 전', '3주 전', '지난주', '이번주']
    const today = new Date()
    
    for (let w = 3; w >= 0; w--) {
        let sum = 0
        for (let d = 0; d < 7; d++) {
            const dayOffset = (w * 7) + d
            const targetDate = new Date(today)
            targetDate.setDate(today.getDate() - dayOffset)

            const year = targetDate.getFullYear()
            const month = String(targetDate.getMonth() + 1).padStart(2, '0')
            const day = String(targetDate.getDate()).padStart(2, '0')
            const dateStr = `${year}-${month}-${day}`
            
            // 유산소는 총 소모량이 의미 있음
            sum += (stats[dateStr] || 0)
        }
        weeklyData.push(sum)
    }

    return {
        labels: labels,
        datasets: [{
            label: '주간 소모 칼로리(kcal)',
            backgroundColor: '#f1c40f', // pastel yellow-ish
            borderColor: '#f1c40f',
            data: weeklyData,
            tension: 0.4,
            fill: false
        }]
    }
})

// 3. 운동 비율 (Doughnut)
const runningRatioChartData = computed(() => {
    // 집계 기준: 칼로리로 할지 시간으로 할지. 소모 칼로리 추이가 있으니 여기선 시간이 나을 듯.
    // 하지만 위 runningTypeStats가 애매하게 작성됐으니 다시 정리.
    const statsByTime = {}
    runningLogs.value.forEach(log => {
        const name = log.exerciseName || '기타'
        if (!statsByTime[name]) statsByTime[name] = 0
        statsByTime[name] += (Number(log.durationMinutes) || 0)
    })
    
    return {
        labels: Object.keys(statsByTime),
        datasets: [{
            backgroundColor: ['#f1c40f', '#e67e22', '#e74c3c', '#95a5a6'],
            data: Object.values(statsByTime)
        }]
    }
})

// 4. 유산소 정규분포 (소모 칼로리 기준)
const cardioMean = 15000 // 월 평균 15000kcal
const cardioStd = 5000
const myCardio = computed(() => monthlyTotalCaloriesBurned.value || 12000)
const cardioZ = (myCardio.value - cardioMean) / cardioStd
const cardioPercentile = 100 * (0.5 * (1 + erf(cardioZ / Math.sqrt(2))))
const cardioTopPercent = (100 - cardioPercentile).toFixed(1)
const cardioY = (1 / (cardioStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((myCardio.value - cardioMean) / cardioStd, 2))

const { dataPoints: cardioData } = generateBellCurveData(cardioMean, cardioStd)

const cardioDistChartData = computed(() => ({
    datasets: [
        {
            type: 'line',
            label: '전체 사용자 분포',
            borderColor: '#fdcb6e', // Darker Yellow
            backgroundColor: 'rgba(253, 203, 110, 0.2)',
            data: cardioData,
            fill: true,
            pointRadius: 0,
            tension: 0.4,
            order: 2
        },
        {
            type: 'scatter',
            label: '나의 위치',
            backgroundColor: '#f1c40f',
            borderColor: '#fff',
            borderWidth: 2,
            data: [{ x: myCardio.value, y: cardioY }],
            pointRadius: 8,
            pointHoverRadius: 12,
            order: 1
        }
    ]
}))


// 기본 차트 옵션 (추이 그래프용 - 카테고리 축)
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' }
    },
    scales: {
        y: {
            beginAtZero: true,
            min: 0,
            ticks: { precision: 0 }
        },
        x: {
            type: 'category', // 명시적 카테고리
            grid: { display: false }
        }
    }
};

// 정규분포 차트 전용 옵션 (Linear 축)
const distChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' }
    },
    scales: {
        y: {
            beginAtZero: true,
            min: 0,
            display: false, // Y축 숨김
            // ticks: { precision: 0 } -> 제거 (소수점 표현을 위해)
        },
        x: {
            type: 'linear',
            grid: { display: false },
            ticks: {
                 callback: function(value) { return Math.round(value); } // 정수만 표시
            }
        }
    }
};

// 식단 정규분포 전용 옵션 (X축 시작점 1900 고정)
const dietDistChartOptions = {
    ...distChartOptions,
    scales: {
        ...distChartOptions.scales,
        x: {
            ...distChartOptions.scales.x,
            min: 1900 // 사용자 요청에 따라 1900부터 시작
        }
    }
};

// 도넛 차트 전용 옵션 (축 없음)
const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' }
    }
    // scales 설정 없음
};
</script>

<template>
  <div class="space-y-8 animate-fade-in relative z-0"> <!-- z-index 0으로 캘린더나 오버레이 간섭 최소화 -->
    
    <!-- 동적 타이틀 + AI 분석 버튼 -->
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-base md:text-lg lg:text-xl font-bold pl-3 border-l-4 flex items-center gap-2 select-none" :class="titleColorClass">
            {{ dashboardTitle }}
        </h2>
        
        <button 
            @click="requestAiAnalysis" 
            class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pastel-red to-pink-400 text-white rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>AI 분석</span>
        </button>
    </div>

    <!-- [식단] 대시보드 -->
    <div v-if="activeTab === 'diet'" class="space-y-6">
        <!-- 1. 영양소 분석 표 (글씨 확대 요청 반영) -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            v-for="item in analysisTable" 
            :key="item.name"
            class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition-shadow group"
          >
            <span class="text-sm font-bold text-gray-400 mb-2 group-hover:text-pastel-red transition-colors">{{ item.name }}</span>
            <span class="text-lg md:text-xl lg:text-2xl font-black text-soft-black">{{ item.value }}</span> <!-- 글씨 크기 확대 -->
            <div class="flex items-center gap-2 mt-2 text-xs md:text-sm"> <!-- 글씨 크기 확대 -->
              <span class="px-2 py-0.5 rounded-full font-bold" :class="[item.color, item.bg]">{{ item.status }}</span>
              <span class="text-gray-400 font-medium">/ {{ item.recommend }}</span>
            </div>
          </div>
        </div>

        <!-- 2. 차트 영역 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px] lg:h-[400px]">
          <!-- 월간 칼로리 추이 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              월간 섭취 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="trendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 탄단지 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              탄단지 비율
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="macroChartData" :options="doughnutChartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2">내 위치 분석</div>
              <span class="text-pastel-red text-sm font-extrabold bg-pastel-red/10 px-2 py-1 rounded-lg">상위 {{ dietStats.topPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="distributionChartData" :options="dietDistChartOptions" />
            </div>
            <p class="text-xs text-center text-gray-400 mt-2">
              * 평균 섭취량 대비 나의 위치
            </p>
          </div>
        </div>
    </div>

    <!-- [근력] 대시보드 -->
    <div v-if="activeTab === 'workout'" class="space-y-6">
        <!-- 1. 상단 요약 (가슴/등/하체 볼륨, 기록일, 기록횟수) -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <!-- 3대 부위 볼륨 -->
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">가슴 볼륨</span>
                <span class="text-lg md:text-xl font-black text-pastel-blue">{{ partVolume['가슴'].toLocaleString() }}kg</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">등 볼륨</span>
                <span class="text-lg md:text-xl font-black text-pastel-blue">{{ partVolume['등'].toLocaleString() }}kg</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">하체 볼륨</span>
                <span class="text-lg md:text-xl font-black text-pastel-blue">{{ partVolume['하체'].toLocaleString() }}kg</span>
            </div>
            <!-- 기록 요약 -->
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">운동 기록일</span>
                <span class="text-lg md:text-xl font-black text-soft-black">{{ workoutDaysCount }}일</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">총 세트 수</span>
                <span class="text-lg md:text-xl font-black text-soft-black">{{ workoutRecordCount }}회</span>
            </div>
        </div>

        <!-- 2. 차트 영역 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px] lg:h-[400px]">
          <!-- 월간 볼륨 추이 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              월간 볼륨 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="volumeTrendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 부위별 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              가슴·등·하체 비율
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="partRatioChartData" :options="doughnutChartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              내 위치 분석
              <span class="text-pastel-blue text-sm font-extrabold bg-pastel-blue/10 px-2 py-1 rounded-lg">상위 {{ volumeTopPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="volumeDistChartData" :options="distChartOptions" />
            </div>
            <p class="text-xs text-center text-gray-400 mt-2">
              * 전체 사용자 평균 볼륨 대비
            </p>
          </div>
        </div>
    </div>

    <!-- [유산소] 대시보드 -->
    <div v-if="activeTab === 'running'" class="space-y-6">
        <!-- 1. 상단 요약 -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">총 운동 시간</span>
                <span class="text-lg md:text-xl font-black text-pastel-yellow">{{ totalRunningTime }}분</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">평균 운동 강도</span>
                <span class="text-lg md:text-xl font-black text-pastel-yellow">{{ avgRunningIntensity }} <span class="text-xs text-gray-400">kcal/min</span></span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">총 소모 칼로리</span>
                <span class="text-lg md:text-xl font-black text-pastel-yellow">{{ monthlyTotalCaloriesBurned }}kcal</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">운동 기록일</span>
                <span class="text-lg md:text-xl font-black text-soft-black">{{ runningDaysCount }}일</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-xs md:text-sm font-bold text-gray-400 mb-1">운동 종류</span>
                <span class="text-lg md:text-xl font-black text-soft-black">{{ runningTypeCount }}종</span>
            </div>
        </div>

        <!-- 2. 차트 영역 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px] lg:h-[400px]">
          <!-- 월간 소모 칼로리 추이 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              월간 소모 칼로리 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="runningTrendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 운동 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              총 운동 비율 (시간)
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="runningRatioChartData" :options="doughnutChartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              내 위치 분석
              <span class="text-pastel-yellow text-sm font-extrabold bg-pastel-yellow/10 px-2 py-1 rounded-lg">상위 {{ cardioTopPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="cardioDistChartData" :options="distChartOptions" />
            </div>
            <p class="text-xs text-center text-gray-400 mt-2">
              * 전체 사용자 평균 소모 칼로리 대비
            </p>
          </div>
        </div>
    </div>
    
    <!-- AI 분석 리포트 모달 -->
    <AiAnalysisReportModal 
        :show="showAiReportModal"
        :report-content="aiReportContent"
        :npc-id="currentNpcId"
        :is-loading="isAiReportLoading"
        @close="closeAiReportModal"
    />
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
