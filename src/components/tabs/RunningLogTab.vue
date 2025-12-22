<script setup>
import { ref, computed } from 'vue'

// 현재 날짜
const currentDate = ref(new Date().toISOString().split('T')[0])

// 러닝 데이터
const distance = ref(5.2)
const hours = ref(0)
const minutes = ref(28)
const seconds = ref(45)

// 계산된 페이스 (분/km)
const pace = computed(() => {
  const totalMinutes = hours.value * 60 + minutes.value + seconds.value / 60
  if (distance.value > 0 && totalMinutes > 0) {
    const paceMinutes = Math.floor(totalMinutes / distance.value)
    const paceSeconds = Math.round(((totalMinutes / distance.value) % 1) * 60)
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`
  }
  return '0:00'
})

// 계산된 칼로리 (대략적인 추정치: km당 60kcal)
const calories = computed(() => {
  return Math.round(distance.value * 60)
})

// 최근 러닝 기록 (더미 데이터)
const recentRuns = ref([
  { date: '2024-01-15', distance: 5.0, duration: '27:30', pace: '5:30' },
  { date: '2024-01-12', distance: 3.5, duration: '18:45', pace: '5:21' },
  { date: '2024-01-10', distance: 7.2, duration: '41:20', pace: '5:44' }
])

const saveRun = () => {
  console.log('Save run')
}
</script>

<template>
  <div class="running-log-tab">
    <!-- 헤더 -->
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-3xl font-bold text-soft-black">Running Log</h2>
      <input 
        type="date" 
        v-model="currentDate"
        class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-pastel-blue focus:outline-none transition-colors"
      />
    </div>

    <!-- 입력 폼 -->
    <div class="bg-gradient-to-br from-pastel-blue/10 to-pastel-blue/5 rounded-2xl p-8 mb-8 border-2 border-pastel-blue/20">
      <h3 class="text-xl font-bold text-soft-black mb-6">Today's Run</h3>
      
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- 거리 입력 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
          <input 
            type="number" 
            v-model="distance"
            step="0.1"
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-blue focus:outline-none text-lg font-semibold text-center transition-colors"
          />
        </div>

        <!-- 시간 입력 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <input 
                type="number" 
                v-model="hours"
                min="0"
                placeholder="H"
                class="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-blue focus:outline-none text-center font-semibold"
              />
              <p class="text-xs text-gray-500 text-center mt-1">Hours</p>
            </div>
            <div>
              <input 
                type="number" 
                v-model="minutes"
                min="0"
                max="59"
                placeholder="M"
                class="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-blue focus:outline-none text-center font-semibold"
              />
              <p class="text-xs text-gray-500 text-center mt-1">Min</p>
            </div>
            <div>
              <input 
                type="number" 
                v-model="seconds"
                min="0"
                max="59"
                placeholder="S"
                class="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:border-pastel-blue focus:outline-none text-center font-semibold"
              />
              <p class="text-xs text-gray-500 text-center mt-1">Sec</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 계산된 통계 -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-white rounded-xl p-4 border border-pastel-blue/30">
          <p class="text-sm text-gray-600 mb-1">Average Pace</p>
          <p class="text-3xl font-bold text-pastel-blue">{{ pace }} <span class="text-lg text-gray-500">/km</span></p>
        </div>
        <div class="bg-white rounded-xl p-4 border border-pastel-blue/30">
          <p class="text-sm text-gray-600 mb-1">Calories Burned</p>
          <p class="text-3xl font-bold text-pastel-blue">~{{ calories }} <span class="text-lg text-gray-500">kcal</span></p>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <button
        @click="saveRun"
        class="w-full mt-6 py-4 bg-gradient-to-r from-pastel-blue to-pastel-red text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        💾 Save Run
      </button>
    </div>

    <!-- 러닝 기록 -->
    <div>
      <h3 class="text-xl font-bold text-soft-black mb-4">Recent Runs</h3>
      <div class="space-y-3">
        <div
          v-for="(run, index) in recentRuns"
          :key="index"
          class="bg-white rounded-xl p-4 border border-gray-100 hover:border-pastel-blue/30 hover:shadow-md transition-all duration-300 grid grid-cols-4 gap-4 items-center"
        >
          <div>
            <p class="text-xs text-gray-500">Date</p>
            <p class="font-bold text-soft-black">{{ run.date }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Distance</p>
            <p class="font-bold text-pastel-blue">{{ run.distance }} km</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Duration</p>
            <p class="font-bold text-soft-black">{{ run.duration }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Pace</p>
            <p class="font-bold text-pastel-blue">{{ run.pace }} /km</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.running-log-tab {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 숫자 입력 스피너 제거 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
