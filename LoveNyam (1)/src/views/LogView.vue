<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import { CHAR_IMAGES } from '@/assets/dummy/index.js'
import { useUiStore } from '@/stores/uiStore'
import { useLogStore } from '@/stores/logStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const logStore = useLogStore()

const { activeTab } = storeToRefs(uiStore)
const { 
  selectedDate, 
  formattedSelectedDate, 
  filteredDietLogs, 
  filteredWorkoutLogs, 
  filteredRunningLogs,
  dashboardStats 
} = storeToRefs(logStore)

const tabs = [
  { id: 'diet', name: '식단', icon: '🥗', color: 'bg-pastel-red', image: CHAR_IMAGES.toma, description: '토마와 함께!' },
  { id: 'workout', name: '운동', icon: '💪', color: 'bg-pastel-yellow', image: CHAR_IMAGES.belle, description: '벨과 득근!' },
  { id: 'running', name: '러닝', icon: '🏃', color: 'bg-pastel-blue', image: CHAR_IMAGES.chie, description: '치에와 질주!' }
]

const setActiveTab = (tabId) => {
  uiStore.setActiveTab(tabId)
  router.push({ query: { ...route.query, tab: tabId } })
  logStore.fetchDashboardStats(tabId)
}

watch(() => route.query.tab, (newTab) => {
  if (newTab && ['diet', 'workout', 'running'].includes(newTab)) {
    uiStore.setActiveTab(newTab)
    logStore.fetchDashboardStats(newTab)
  }
})

onMounted(() => {
  if (route.query.tab) {
    uiStore.setActiveTab(route.query.tab)
  }
  logStore.fetchLogs()
  logStore.fetchDashboardStats(activeTab.value)
})

// --- Calendar Logic ---
const currentDate = ref(new Date())

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month + 1, 0).getDate()
})
const firstDayOfMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return new Date(year, month, 1).getDay()
})
const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfMonth.value; i++) days.push(null)
  for (let i = 1; i <= daysInMonth.value; i++) days.push(i)
  return days
})

const selectDate = (day) => {
  if (!day) return
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const newDate = new Date(year, month, day)
  logStore.setSelectedDate(newDate)
  logStore.fetchLogs()
}

const isSelectedDate = (day) => {
  if (!day) return false
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const checkDate = new Date(year, month, day)
  return checkDate.toDateString() === selectedDate.value.toDateString()
}

// Mock Data for Calendar Indicators (Keeping local for now as it's complex to mock fully in store without more API)
const calendarData = ref({
  5: ['diet'],
  12: ['diet', 'workout'],
  15: ['running'],
  20: ['diet', 'workout', 'running']
})

// --- Form States (Simplified) ---
const dietForm = ref({ foodName: '', calory: '' })
const workoutForm = ref({ part: '전신', exerciseName: '', setCount: '', repsPerSet: '', durationMinutes: '' })
const runningForm = ref({ location: '', distance: '', durationMinutes: '' })

const addDietLog = async () => {
  if (!dietForm.value.foodName) return
  await logStore.addDietLog({ 
    date: selectedDate.value.toDateString(),
    ...dietForm.value, 
    calory: Number(dietForm.value.calory) 
  })
  dietForm.value = { foodName: '', calory: '' }
  // Update calendar indicator (mock)
  const day = selectedDate.value.getDate()
  if (!calendarData.value[day]) calendarData.value[day] = []
  if (!calendarData.value[day].includes('diet')) calendarData.value[day].push('diet')
}
const addWorkoutLog = async () => {
  if (!workoutForm.value.exerciseName) return
  await logStore.addWorkoutLog({ 
    date: selectedDate.value.toDateString(),
    ...workoutForm.value 
  })
  workoutForm.value = { part: '전신', exerciseName: '', setCount: '', repsPerSet: '', durationMinutes: '' }
  const day = selectedDate.value.getDate()
  if (!calendarData.value[day]) calendarData.value[day] = []
  if (!calendarData.value[day].includes('workout')) calendarData.value[day].push('workout')
}
const addRunningLog = async () => {
  if (!runningForm.value.location) return
  await logStore.addRunningLog({ 
    date: selectedDate.value.toDateString(),
    ...runningForm.value 
  })
  runningForm.value = { location: '', distance: '', durationMinutes: '' }
  const day = selectedDate.value.getDate()
  if (!calendarData.value[day]) calendarData.value[day] = []
  if (!calendarData.value[day].includes('running')) calendarData.value[day].push('running')
}
</script>

<template>
  <MainLayout>
    <template #default>
      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-soft-black mb-2">활동 기록</h1>
        <p class="text-gray-500">오늘의 노력을 기록해보세요!</p>
      </div>

      <!-- Character Tabs -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          role="button"
          tabindex="0"
          @click="setActiveTab(tab.id)"
          @keydown.enter="setActiveTab(tab.id)"
          class="relative h-48 rounded-3xl overflow-hidden transition-all duration-300 group border-4 cursor-pointer"
          :class="activeTab === tab.id ? `border-pastel-red shadow-xl scale-105` : 'border-transparent hover:border-pastel-red/30 grayscale hover:grayscale-0'"
        >
          <!-- Background Image -->
          <img :src="tab.image" :alt="tab.name" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          
          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white text-left">
            <div class="transform transition-transform duration-300" :class="activeTab === tab.id ? 'translate-y-0' : 'translate-y-2'">
              <p class="text-xs font-bold opacity-80 mb-1">{{ tab.description }}</p>
              <h3 class="text-2xl font-bold flex items-center gap-2">
                <span>{{ tab.icon }}</span>
                {{ tab.name }}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard & Calendar Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Calendar Card (Expanded to col-span-2) -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <h3 class="text-lg font-bold text-soft-black mb-4 text-center flex items-center justify-center gap-2">
            <span>📅</span> {{ currentDate.getMonth() + 1 }}월
          </h3>
          <div class="grid grid-cols-7 gap-2 text-center text-sm">
            <div v-for="day in ['일','월','화','수','목','금','토']" :key="day" class="text-gray-400 text-xs font-bold py-2">{{ day }}</div>
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index" 
              class="aspect-square flex items-center justify-center relative rounded-xl transition-all duration-200 cursor-pointer border-2"
              :class="[
                day ? 'hover:bg-gray-50 hover:border-pastel-red/30' : '',
                isSelectedDate(day) ? 'bg-pastel-red/10 border-pastel-red text-pastel-red font-bold' : 'border-transparent'
              ]"
              @click="selectDate(day)"
            >
              <span :class="{'text-gray-300': !day}">{{ day }}</span>
              <!-- Indicators -->
              <div v-if="day && calendarData[day]" class="absolute bottom-2 flex gap-1">
                <div v-if="calendarData[day].includes('diet')" class="w-1.5 h-1.5 rounded-full bg-pastel-red"></div>
                <div v-if="calendarData[day].includes('workout')" class="w-1.5 h-1.5 rounded-full bg-pastel-yellow"></div>
                <div v-if="calendarData[day].includes('running')" class="w-1.5 h-1.5 rounded-full bg-pastel-blue"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Card (Compact to col-span-1) -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-center">
          <h3 class="text-xl font-bold text-soft-black mb-6 text-center">{{ dashboardStats.title }}</h3>
          <div class="space-y-4">
            <div v-for="(stat, index) in dashboardStats.stats" :key="index" class="bg-cream/50 rounded-2xl p-5 text-center border border-gray-100">
              <p class="text-gray-500 text-sm mb-2">{{ stat.label }}</p>
              <p class="text-2xl font-bold text-pastel-red">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-3xl p-6 shadow-sm min-h-[400px]">
        <div class="mb-6 pb-4 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-soft-black">{{ formattedSelectedDate }} 기록</h2>
        </div>
        
        <!-- Diet Tab -->
        <div v-if="activeTab === 'diet'" class="animate-fade-in space-y-8">
          <!-- Input Form -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-red/20">
            <h3 class="text-xl font-bold text-pastel-red mb-4 flex items-center gap-2">
              <span>✏️</span> 식단 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input v-model="dietForm.foodName" placeholder="메뉴 이름 (예: 닭가슴살)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red md:col-span-2" />
              <input v-model="dietForm.calory" type="number" placeholder="칼로리 (kcal)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red" />
            </div>
            <button @click="addDietLog" class="w-full mt-4 bg-pastel-red text-white py-3 rounded-xl font-bold hover:bg-pastel-red/90 transition-colors">
              등록하기
            </button>
          </div>

          <!-- Log List -->
          <div class="space-y-4">
            <div v-if="filteredDietLogs.length === 0" class="text-center py-10 text-gray-400">
              <p class="mb-2">🍽️</p>
              기록된 식단이 없습니다.
            </div>
            <div v-for="log in filteredDietLogs" :key="log.id" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-red/10 flex items-center justify-center text-2xl">
                  🥗
                </div>
                <div>
                  <p class="font-bold text-soft-black">{{ log.foodName }}</p>
                </div>
              </div>
              <span class="font-bold text-gray-500">{{ log.calory }} kcal</span>
            </div>
          </div>
        </div>

        <!-- Workout Tab -->
        <div v-if="activeTab === 'workout'" class="animate-fade-in space-y-8">
          <!-- Input Form -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-yellow/20">
            <h3 class="text-xl font-bold text-pastel-yellow mb-4 flex items-center gap-2">
              <span>💪</span> 운동 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select v-model="workoutForm.part" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow">
                <option>전신</option>
                <option>상체</option>
                <option>하체</option>
                <option>유산소</option>
              </select>
              <input v-model="workoutForm.exerciseName" placeholder="운동 이름 (예: 스쿼트)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
            </div>
            <div class="grid grid-cols-3 gap-4">
              <input v-model="workoutForm.setCount" type="number" placeholder="세트" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
              <input v-model="workoutForm.repsPerSet" type="number" placeholder="회/분" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
              <input v-model="workoutForm.durationMinutes" type="number" placeholder="시간(분)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
            </div>
            <button @click="addWorkoutLog" class="w-full mt-4 bg-pastel-yellow text-white py-3 rounded-xl font-bold hover:bg-pastel-yellow/90 transition-colors shadow-sm">
              등록하기
            </button>
          </div>

          <!-- Log List -->
          <div class="space-y-4">
            <div v-if="filteredWorkoutLogs.length === 0" class="text-center py-10 text-gray-400">
              <p class="mb-2">💪</p>
              기록된 운동이 없습니다.
            </div>
            <div v-for="log in filteredWorkoutLogs" :key="log.id" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-yellow/10 flex items-center justify-center text-2xl">
                  🏋️
                </div>
                <div>
                  <span class="text-xs font-bold text-pastel-yellow bg-pastel-yellow/10 px-2 py-1 rounded-full">{{ log.part }}</span>
                  <p class="font-bold text-soft-black mt-1">{{ log.exerciseName }}</p>
                </div>
              </div>
              <div class="text-right text-sm text-gray-500">
                <p v-if="log.setCount">{{ log.setCount }}세트 x {{ log.repsPerSet }}회</p>
                <p v-if="log.durationMinutes">{{ log.durationMinutes }}분</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Running Tab -->
        <div v-if="activeTab === 'running'" class="animate-fade-in space-y-8">
          <!-- Input Form -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-blue/20">
            <h3 class="text-xl font-bold text-pastel-blue mb-4 flex items-center gap-2">
              <span>🏃</span> 러닝 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input v-model="runningForm.location" placeholder="러닝 장소 (예: 한강 공원)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue md:col-span-2" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <input v-model="runningForm.distance" type="number" step="0.1" placeholder="거리 (km)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
              <input v-model="runningForm.durationMinutes" type="number" placeholder="시간 (분)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
            </div>
            <button @click="addRunningLog" class="w-full mt-4 bg-pastel-blue text-white py-3 rounded-xl font-bold hover:bg-pastel-blue/90 transition-colors shadow-sm">
              등록하기
            </button>
          </div>

          <!-- Log List -->
          <div class="space-y-4">
            <div v-if="filteredRunningLogs.length === 0" class="text-center py-10 text-gray-400">
              <p class="mb-2">👟</p>
              기록된 러닝이 없습니다.
            </div>
            <div v-for="log in filteredRunningLogs" :key="log.id" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-blue/10 flex items-center justify-center text-2xl">
                  👟
                </div>
                <div>
                  <p class="font-bold text-soft-black">{{ log.location }}</p>
                  <p class="text-xs text-gray-400">{{ formattedSelectedDate }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-bold text-pastel-blue text-lg">{{ log.distance }} km</p>
                <p class="text-sm text-gray-500">{{ log.durationMinutes }}분</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </MainLayout>
</template>
