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

const logStore = useLogStore()
const { workoutLogs, muscleExercises, monthlyTotalCaloriesIntake } = storeToRefs(logStore)

// --- 공통: 동적 타이틀 ---
const dashboardTitle = computed(() => {
    if (props.activeTab === 'diet') return '월간 식단 데이터 분석'
    if (props.activeTab === 'workout') return '월간 근력 데이터 분석'
    return '월간 유산소 데이터 분석'
})

const titleColorClass = computed(() => {
    if (props.activeTab === 'diet') return 'border-pastel-red text-pastel-red'
    if (props.activeTab === 'workout') return 'border-pastel-blue text-pastel-blue'
    return 'border-pastel-yellow text-pastel-yellow'
})

// --- 데이터 분석 (Mock Data & Store Data 혼합) ---
// * 정규분포표 데이터 생성을 위한 설정값입니다. 나중에 실제 유저 데이터 통계로 교체하세요.
const MEAN_CALORIES = 2295.8 // 평균 섭취 칼로리
const STD_DEV = 300 // 표준 편차
const MY_CALORIES = computed(() => logStore.monthlyTotalCaloriesIntake || 1850) // 내 섭취량 (Store 연동)

// 정규분포 데이터 생성 함수
const generateBellCurveData = (mean, stdDev) => {
  const dataPoints = []
  const labels = []
  const step = stdDev / 2
  const min = mean - 4 * stdDev
  const max = mean + 4 * stdDev

  for (let x = min; x <= max; x += step) {
    const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2)
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent)
    dataPoints.push(y)
    labels.push(Math.round(x))
  }
  return { labels, dataPoints }
}

const { labels: bellLabels, dataPoints: bellData } = generateBellCurveData(MEAN_CALORIES, STD_DEV)

// =======================
// [식단] 관련 데이터
// =======================
// 1. 월간 칼로리 추이 (Line Chart)
const trendChartData = computed(() => ({
  labels: ['1주', '2주', '3주', '4주'], // * 실제로는 일별/주별 날짜가 들어갑니다.
  datasets: [
    {
      label: '섭취 칼로리',
      backgroundColor: '#ff6b8a',
      borderColor: '#ff6b8a',
      data: [1800, 2100, 1950, MY_CALORIES.value], // * Store 데이터와 연동 필
      tension: 0.4, // 부드러운 곡선
      fill: false
    }
  ]
}));

// 2. 탄단지 비율 (Doughnut Chart)
const macroChartData = {
  labels: ['탄수화물', '단백질', '지방'],
  datasets: [
    {
      backgroundColor: ['#ff9f43', '#54a0ff', '#ff6b8a'],
      data: [50, 30, 20] 
    }
  ]
};

// 3. 정규분포표 (식단)
const normalDistributionData = generateBellCurveData(MEAN_CALORIES, STD_DEV).dataPoints
const normalLabels = generateBellCurveData(MEAN_CALORIES, STD_DEV).labels

// Math.erf 구현 (근사) - 로컬 함수로 정의
const erf = (x) => {
  var t = 1.0 / (1.0 + 0.5 * Math.abs(x));
  var tau = t * Math.exp(-x*x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * (0.17087277))))))))));
  return x >= 0 ? 1 - tau : tau - 1;
}

// 통계적 위치 계산 (z-score -> percentile)
const zScore = (MY_CALORIES.value - MEAN_CALORIES) / STD_DEV
const percentile = 100 * (0.5 * (1 + erf(zScore / Math.sqrt(2))))
const topPercent = (100 - percentile).toFixed(1) // 상위 %
const myY = (1 / (STD_DEV * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((MY_CALORIES.value - MEAN_CALORIES) / STD_DEV, 2))

const distributionChartData = computed(() => ({
  labels: normalLabels,
  datasets: [
    {
      type: 'line',
      label: '전체 사용자 분포',
      borderColor: '#c7ecee',
      backgroundColor: 'rgba(199, 236, 238, 0.5)',
      data: normalDistributionData,
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
      data: [{ x: MY_CALORIES.value, y: myY }],
      pointRadius: 8,
      pointHoverRadius: 12,
      order: 1
    }
  ]
}));

// 식단 분석 테이블
const analysisTable = [
  { name: '탄수화물', value: '250g', recommend: '300g', status: '적정', color: 'text-green-500', bg: 'bg-green-50' },
  { name: '단백질', value: '120g', recommend: '100g', status: '충분', color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: '지방', value: '60g', recommend: '50g', status: '주의', color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { name: '당류', value: '30g', recommend: '25g', status: '과다', color: 'text-red-500', bg: 'bg-red-50' },
  { name: '칼로리', value: `${MY_CALORIES.value}kcal`, recommend: '2000kcal', status: '양호', color: 'text-green-500', bg: 'bg-green-50' }
];

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

// 1. 월간 볼륨 추이 (Line Chart)
// (실제로는 날짜별 합산해야 하지만 Mock으로 처리)
const volumeTrendChartData = computed(() => ({
    labels: ['1주', '2주', '3주', '4주'],
    datasets: [{
        label: '총 볼륨(kg)',
        backgroundColor: '#54a0ff',
        borderColor: '#54a0ff',
        data: [5000, 8000, 6500, totalVolume.value || 10000],
        tension: 0.4,
        fill: false
    }]
}));

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

const { labels: volLabels, dataPoints: volData } = generateBellCurveData(volumeMean, volumeStd);

const volumeDistChartData = computed(() => ({
    labels: volLabels,
    datasets: [
        {
            type: 'line',
            label: '전체 사용자 분포',
            borderColor: '#dfe6e9',
            backgroundColor: 'rgba(223, 230, 233, 0.5)',
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

// 2. 월간 소모 칼로리 추이 (Line Chart)
const runningTrendChartData = computed(() => ({
    labels: ['1주', '2주', '3주', '4주'],
    datasets: [{
        label: '소모 칼로리(kcal)',
        backgroundColor: '#f1c40f', // pastel yellow-ish
        borderColor: '#f1c40f',
        data: [1200, 1500, 1000, monthlyTotalCaloriesBurned.value || 3000],
        tension: 0.4,
        fill: false
    }]
}))

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

const { labels: cardioLabels, dataPoints: cardioData } = generateBellCurveData(cardioMean, cardioStd)

const cardioDistChartData = computed(() => ({
    labels: cardioLabels,
    datasets: [
        {
            type: 'line',
            label: '전체 사용자 분포',
            borderColor: '#fceaa9',
            backgroundColor: 'rgba(252, 234, 169, 0.5)',
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


const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: true, position: 'bottom' }
    }
};
</script>

<template>
  <div class="space-y-8 animate-fade-in relative z-0"> <!-- z-index 0으로 캘린더나 오버레이 간섭 최소화 -->
    
    <!-- 동적 타이틀 -->
    <h2 class="text-xl font-bold mb-4 pl-3 border-l-4 flex items-center gap-2 select-none" :class="titleColorClass">
        {{ dashboardTitle }}
    </h2>

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
            <span class="text-2xl font-black text-soft-black">{{ item.value }}</span> <!-- 글씨 크기 확대 -->
            <div class="flex items-center gap-2 mt-2 text-sm"> <!-- 글씨 크기 확대 -->
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
              <span>📈</span> 월간 섭취 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="trendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 탄단지 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>🍰</span> 탄단지 비율
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="macroChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2"><span>🔔</span> 내 위치 분석</div>
              <span class="text-pastel-red text-sm font-extrabold bg-pastel-red/10 px-2 py-1 rounded-lg">상위 {{ topPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="distributionChartData" :options="{ ...chartOptions, scales: { y: { display: false } } }" />
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
                <span class="text-sm font-bold text-gray-400 mb-1">가슴 볼륨</span>
                <span class="text-xl font-black text-pastel-blue">{{ partVolume['가슴'].toLocaleString() }}kg</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">등 볼륨</span>
                <span class="text-xl font-black text-pastel-blue">{{ partVolume['등'].toLocaleString() }}kg</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">하체 볼륨</span>
                <span class="text-xl font-black text-pastel-blue">{{ partVolume['하체'].toLocaleString() }}kg</span>
            </div>
            <!-- 기록 요약 -->
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">운동 기록일</span>
                <span class="text-xl font-black text-soft-black">{{ workoutDaysCount }}일</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">총 세트 수</span>
                <span class="text-xl font-black text-soft-black">{{ workoutRecordCount }}회</span>
            </div>
        </div>

        <!-- 2. 차트 영역 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px] lg:h-[400px]">
          <!-- 월간 볼륨 추이 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>💪</span> 월간 볼륨 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="volumeTrendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 부위별 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>📊</span> 가슴·등·하체 비율
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="partRatioChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2"><span>🏆</span> 내 위치 분석</div>
              <span class="text-pastel-blue text-sm font-extrabold bg-pastel-blue/10 px-2 py-1 rounded-lg">상위 {{ volumeTopPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="volumeDistChartData" :options="{ ...chartOptions, scales: { y: { display: false } } }" />
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
                <span class="text-sm font-bold text-gray-400 mb-1">총 운동 시간</span>
                <span class="text-xl font-black text-pastel-yellow">{{ totalRunningTime }}분</span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">평균 운동 강도</span>
                <span class="text-xl font-black text-pastel-yellow">{{ avgRunningIntensity }} <span class="text-xs text-gray-400">kcal/min</span></span>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">총 소모 칼로리</span>
                <span class="text-xl font-black text-pastel-yellow">{{ monthlyTotalCaloriesBurned }}kcal</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">운동 기록일</span>
                <span class="text-xl font-black text-soft-black">{{ runningDaysCount }}일</span>
            </div>
             <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                <span class="text-sm font-bold text-gray-400 mb-1">운동 종류</span>
                <span class="text-xl font-black text-soft-black">{{ runningTypeCount }}종</span>
            </div>
        </div>

        <!-- 2. 차트 영역 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px] lg:h-[400px]">
          <!-- 월간 소모 칼로리 추이 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>🔥</span> 월간 소모 칼로리 추이
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="runningTrendChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 운동 비율 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span>⏱️</span> 총 운동 비율 (시간)
            </h3>
            <div class="flex-1 relative w-full h-full flex items-center justify-center">
               <Doughnut :data="runningRatioChartData" :options="chartOptions" />
            </div>
          </div>

          <!-- 정규분포표 (내 위치) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 class="font-bold text-gray-700 mb-4 flex items-center gap-2 justify-between">
              <div class="flex items-center gap-2"><span>🏅</span> 내 위치 분석</div>
              <span class="text-pastel-yellow text-sm font-extrabold bg-pastel-yellow/10 px-2 py-1 rounded-lg">상위 {{ cardioTopPercent }}%</span>
            </h3>
            <div class="flex-1 relative w-full h-full">
               <Line :data="cardioDistChartData" :options="{ ...chartOptions, scales: { y: { display: false } } }" />
            </div>
            <p class="text-xs text-center text-gray-400 mt-2">
              * 전체 사용자 평균 소모량 대비
            </p>
          </div>
        </div>
    </div>

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
