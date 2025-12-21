<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'
import { useRoute, useRouter } from 'vue-router'
import { CHAR_IMAGES, LOG_IMAGES } from '@/assets/dummy/index.js'
import { useUiStore } from '@/stores/uiStore'
import { useLogStore } from '@/stores/logStore'
import { storeToRefs } from 'pinia'

// Stamp Images
import tomaStamp from '@/assets/stamp/toma.jpg'
import belleStamp from '@/assets/stamp/belle.jpg'
import chiiStamp from '@/assets/stamp/chii.jpg'

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
  calendarLogStatus,
  muscleExercises,
  cardioExercises,
  isLoading,
  monthlyTotalCaloriesIntake,
  monthlyTotalVolume,
  monthlyTotalCaloriesBurned
} = storeToRefs(logStore)

const tabs = [
  { id: 'diet', name: '식단', image: LOG_IMAGES.toma, color: 'text-pastel-red', border: 'border-pastel-red', bg: 'bg-pastel-red/10' },
  { id: 'workout', name: '근력', image: LOG_IMAGES.belle, color: 'text-pastel-blue', border: 'border-pastel-blue', bg: 'bg-pastel-blue/10' },
  { id: 'running', name: '유산소', image: LOG_IMAGES.chie, color: 'text-pastel-yellow', border: 'border-pastel-yellow', bg: 'bg-pastel-yellow/10' }
]

const setActiveTab = (tabId) => {
  uiStore.setActiveTab(tabId)
  router.push({ query: { ...route.query, tab: tabId } })
}

watch(() => route.query.tab, (newTab) => {
  if (newTab && ['diet', 'workout', 'running'].includes(newTab)) {
    uiStore.setActiveTab(newTab)
  }
})

onMounted(async () => {
  if (route.query.tab) {
    uiStore.setActiveTab(route.query.tab)
  }
  // 운동 종목 목록 및 월별 로그 로드
  await logStore.fetchExercises()
  await logStore.fetchMonthlyLogs()
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
}

const isSelectedDate = (day) => {
  if (!day) return false
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const checkDate = new Date(year, month, day)
  return checkDate.toDateString() === selectedDate.value.toDateString()
}

// 날짜를 YYYY-MM-DD 형식으로 변환
const formatDateString = (day) => {
  if (!day) return ''
  const year = currentDate.value.getFullYear()
  const month = String(currentDate.value.getMonth() + 1).padStart(2, '0')
  const dayStr = String(day).padStart(2, '0')
  return `${year}-${month}-${dayStr}`
}

const getDailyLogs = (day) => {
  if (!day) return []
  const dateStr = formatDateString(day)
  return calendarLogStatus.value[dateStr] || []
}

// --- Form States ---
const dietForm = ref({ foodId: '', quantity: 1 })
const workoutForm = ref({ muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '' })
const runningForm = ref({ cardioExerciseId: '', durationMinutes: '', burnedKcal: '' })

// 음식 검색 관련
const foodSearchQuery = ref('')
const foodSearchResults = ref([])
const selectedFood = ref(null)

const searchFood = async () => {
  if (foodSearchQuery.value.length < 2) {
    foodSearchResults.value = []
    return
  }
  try {
    const { logApi } = await import('@/api/logApi')
    const response = await logApi.searchFood(foodSearchQuery.value)
    foodSearchResults.value = response.data || []
  } catch (err) {
    console.error('Food search failed:', err)
    foodSearchResults.value = []
  }
}

// --- Editing State ---
const editingId = ref(null)
const editingType = ref(null) // 'diet', 'workout', 'running'
const isEditing = ref(false)

// Edit Forms (Separate from Add Forms)
const editDietForm = ref({ foodId: '', quantity: 1, foodName: '', calory: 0 })
const editWorkoutForm = ref({ muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '' })
const editRunningForm = ref({ cardioExerciseId: '', durationMinutes: '', burnedKcal: '' })

// Edit Food Search (Separate from Add)
const editFoodSearchQuery = ref('')
const editFoodSearchResults = ref([])
const editSelectedFood = ref(null)

const searchEditFood = async () => {
  if (editFoodSearchQuery.value.length < 2) {
    editFoodSearchResults.value = []
    return
  }
  try {
    const { logApi } = await import('@/api/logApi')
    const response = await logApi.searchFood(editFoodSearchQuery.value)
    editFoodSearchResults.value = response.data || []
  } catch (err) {
    console.error('Edit food search failed:', err)
    editFoodSearchResults.value = []
  }
}

const selectEditFood = (food) => {
  editSelectedFood.value = food
  editDietForm.value.foodId = food.foodId
  editDietForm.value.foodName = food.foodName
  editDietForm.value.calory = food.calory
  editFoodSearchQuery.value = food.foodName
  editFoodSearchResults.value = []
}

// Restore selectFood (Missing Function)
const selectFood = (food) => {
  selectedFood.value = food
  dietForm.value.foodId = food.foodId
  foodSearchQuery.value = food.foodName
  foodSearchResults.value = []
}

const startEdit = (type, log) => {
  isEditing.value = true
  editingType.value = type
  
  if (type === 'diet') {
    editingId.value = log.userFoodId
    editDietForm.value = {
      foodId: log.foodId,
      quantity: log.quantity,
      foodName: log.foodName,
      calory: log.calory
    }
    editFoodSearchQuery.value = log.foodName
    editSelectedFood.value = { foodId: log.foodId, foodName: log.foodName, calory: log.calory }
  } else if (type === 'workout') {
    editingId.value = log.muscleLogId
    editWorkoutForm.value = {
      muscleExerciseId: log.muscleExerciseId || log.exerciseId,
      weight: log.weight,
      setCount: log.setCount,
      repsPerSet: log.repsPerSet
    }
  } else if (type === 'running') {
    editingId.value = log.cardioLogId
    editRunningForm.value = {
      cardioExerciseId: log.cardioExerciseId || log.exerciseId,
      durationMinutes: log.durationMinutes,
      burnedKcal: log.burnedKcal
    }
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editingId.value = null
  editingType.value = null
  editDietForm.value = { foodId: '', quantity: 1, foodName: '', calory: 0 }
  editWorkoutForm.value = { muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '' }
  editRunningForm.value = { cardioExerciseId: '', durationMinutes: '', burnedKcal: '' }
  editFoodSearchQuery.value = ''
  editFoodSearchResults.value = []
  editSelectedFood.value = null
}

// --- Delete Confirm Modal State ---
const showDeleteModal = ref(false)
const deleteTarget = ref({ type: '', id: null, name: '', date: '' })

const openDeleteModal = (type, id, name) => {
  deleteTarget.value = {
    type,
    id,
    name,
    date: formattedSelectedDate.value
  }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  const { type, id } = deleteTarget.value
  let success = false
  
  try {
    if (type === 'diet') success = await logStore.deleteDietLog(id)
    else if (type === 'workout') success = await logStore.deleteWorkoutLog(id)
    else if (type === 'running') success = await logStore.deleteRunningLog(id)
    
    if (success) {
      if (editingId.value === id) cancelEdit()
    } else {
      alert('삭제에 실패했습니다. (서버 응답 없음)')
    }
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제 중 오류가 발생했습니다.')
  } finally {
    showDeleteModal.value = false
    deleteTarget.value = { type: '', id: null, name: '', date: '' }
  }
}

const cancelDeleteModal = () => {
  showDeleteModal.value = false
  deleteTarget.value = { type: '', id: null, name: '', date: '' }
}

// Add Functions (Pure Add)
const addDietLog = async () => {
  if (!dietForm.value.foodId) {
    logStore.error = '음식 검색 후 목록에서 선택해주세요.'
    setTimeout(() => logStore.error = null, 3000)
    return
  }
  const success = await logStore.addDietLog({ 
    foodId: String(dietForm.value.foodId),
    quantity: Number(dietForm.value.quantity) || 1
  })
  if (success) {
    dietForm.value = { foodId: '', quantity: 1 }
    foodSearchQuery.value = ''
    selectedFood.value = null
  }
}

const addWorkoutLog = async () => {
  if (!workoutForm.value.muscleExerciseId) {
    alert('운동 종목을 선택해주세요.') 
    return
  }
  const success = await logStore.addWorkoutLog({ 
    muscleExerciseId: Number(workoutForm.value.muscleExerciseId),
    setCount: Number(workoutForm.value.setCount) || 1,
    repsPerSet: Number(workoutForm.value.repsPerSet) || 1,
    weight: Number(workoutForm.value.weight) || 0
  })
  if (success) {
    workoutForm.value = { muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '' }
  }
}

const addRunningLog = async () => {
  if (!runningForm.value.cardioExerciseId) {
    alert('운동 종목을 선택해주세요.')
    return
  }
  const success = await logStore.addRunningLog({ 
    cardioExerciseId: Number(runningForm.value.cardioExerciseId),
    durationMinutes: Number(runningForm.value.durationMinutes) || 0,
    burnedKcal: Number(runningForm.value.burnedKcal) || 0
  })
  if (success) {
    runningForm.value = { cardioExerciseId: '', durationMinutes: '', burnedKcal: '' }
  }
}

// Update Functions (Use Edit Forms)
const handleUpdateDiet = async () => {
  const success = await logStore.updateDietLog(editingId.value, {
      foodId: String(editDietForm.value.foodId),
      quantity: Number(editDietForm.value.quantity) || 1
  })
  if (success) cancelEdit()
}

const handleUpdateWorkout = async () => {
  const success = await logStore.updateWorkoutLog(editingId.value, {
     muscleExerciseId: Number(editWorkoutForm.value.muscleExerciseId),
     setCount: Number(editWorkoutForm.value.setCount) || 1,
     repsPerSet: Number(editWorkoutForm.value.repsPerSet) || 1,
     weight: Number(editWorkoutForm.value.weight) || 0
  })
  if (success) cancelEdit()
}

const handleUpdateRunning = async () => {
  const success = await logStore.updateRunningLog(editingId.value, {
      cardioExerciseId: Number(editRunningForm.value.cardioExerciseId),
      durationMinutes: Number(editRunningForm.value.durationMinutes) || 0,
      burnedKcal: Number(editRunningForm.value.burnedKcal) || 0
  })
  if (success) cancelEdit()
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
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="flex flex-col items-center gap-2 md:gap-4 group cursor-pointer"
          @click="setActiveTab(tab.id)"
          @keydown.enter="setActiveTab(tab.id)"
          role="button"
          tabindex="0"
        >
          <!-- Badge (Name Tag outside) -->
          <div 
            class="px-4 py-1.5 md:px-8 md:py-2 rounded-full border-2 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1 whitespace-nowrap"
            :class="[tab.border, activeTab === tab.id ? 'ring-2 ring-offset-2 ' + tab.border.replace('border-', 'ring-') : '']"
          >
            <span class="text-sm md:text-xl font-bold tracking-widest transition-all duration-300" :class="tab.color">{{ tab.name }}</span>
          </div>

          <!-- Image Container -->
          <div 
            class="relative w-full max-w-[200px] sm:max-w-none aspect-[4/3] rounded-3xl overflow-hidden shadow-md transition-all duration-300 border-4"
            :class="activeTab === tab.id ? tab.border + ' shadow-xl scale-105' : 'border-transparent grayscale hover:grayscale-0 hover:shadow-lg'"
          >
            <img :src="tab.image" :alt="tab.name" class="w-full h-full object-cover" />
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
              <span :class="{'text-gray-300': !day}" class="z-10 relative">{{ day }}</span>
              <!-- Indicators (Stamps) -->
              <div v-if="day" class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
                <div class="relative w-full h-full p-0.5 overflow-hidden">
                   <img v-if="getDailyLogs(day).includes('diet')" :src="tomaStamp" class="absolute top-0 right-0 w-8 h-8 rounded-full border-2 border-white shadow-md object-cover transform rotate-12 z-20" alt="stamp" />
                   <img v-if="getDailyLogs(day).includes('workout')" :src="belleStamp" class="absolute bottom-0 left-0 w-8 h-8 rounded-full border-2 border-white shadow-md object-cover transform -rotate-12 z-20" alt="stamp" />
                   <img v-if="getDailyLogs(day).includes('running')" :src="chiiStamp" class="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 border-white shadow-md object-cover transform rotate-45 z-20" alt="stamp" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard Card (Compact to col-span-1) -->
        <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-1 flex flex-col justify-center">
          <h3 class="text-xl font-bold text-soft-black mb-6 text-center">이번 달 요약</h3>
          <div class="space-y-4">
            <div class="bg-cream/50 rounded-2xl p-5 text-center border border-gray-100">
              <p class="text-gray-500 text-sm mb-2">총 섭취량</p>
              <p class="text-2xl font-bold text-pastel-red">{{ monthlyTotalCaloriesIntake.toLocaleString() }} <span class="text-sm font-normal text-gray-400">kcal</span></p>
            </div>
            <div class="bg-cream/50 rounded-2xl p-5 text-center border border-gray-100">
              <p class="text-gray-500 text-sm mb-2">총 볼륨</p>
              <p class="text-2xl font-bold text-pastel-blue">{{ monthlyTotalVolume.toLocaleString() }} <span class="text-sm font-normal text-gray-400">kg</span></p>
            </div>
            <div class="bg-cream/50 rounded-2xl p-5 text-center border border-gray-100">
              <p class="text-gray-500 text-sm mb-2">총 소모량</p>
              <p class="text-2xl font-bold text-pastel-yellow">{{ monthlyTotalCaloriesBurned.toLocaleString() }} <span class="text-sm font-normal text-gray-400">kcal</span></p>
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
          <!-- Add Form (Always Visible) -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-red/20">
            <h3 class="text-xl font-bold text-pastel-red mb-4 flex items-center gap-2">
              <span>✏️</span> 식단 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2 relative">
                <input 
                  v-model="foodSearchQuery" 
                  @input="searchFood" 
                  placeholder="음식 검색 (예: 닭가슴살)" 
                  class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red" 
                />
                <div v-if="foodSearchResults.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  <div 
                    v-for="food in foodSearchResults" 
                    :key="food.foodId" 
                    @click="selectFood(food)"
                    class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                  >
                    <p class="font-medium text-soft-black">{{ food.foodName }}</p>
                    <p class="text-xs text-gray-400">{{ food.calory }} kcal (100g 기준)</p>
                  </div>
                </div>
              </div>
              <input v-model="dietForm.quantity" type="number" step="0.1" min="0.1" placeholder="수량 (인분)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red" />
            </div>
            <div v-if="selectedFood" class="mt-2 p-3 bg-pastel-red/10 rounded-xl text-sm text-gray-600">
              선택됨: <span class="font-bold text-pastel-red">{{ selectedFood.foodName }}</span> ({{ selectedFood.calory }} kcal)
            </div>
            <button @click="addDietLog" class="w-full mt-4 bg-pastel-red text-white py-3 rounded-xl font-bold hover:bg-pastel-red/90 transition-colors shadow-sm active:scale-95 transform transition-transform">
              등록하기
            </button>
            <div v-if="logStore.error" class="mt-4 p-3 bg-red-100 text-red-600 rounded-xl text-center font-bold text-sm">
              {{ logStore.error }}
            </div>
          </div>

          <!-- Log List -->
          <div class="space-y-4">
            <div v-if="filteredDietLogs.length === 0" class="text-center py-10 text-gray-400">
              <p class="mb-2">🍽️</p>
              기록된 식단이 없습니다.
            </div>
            <div v-for="log in filteredDietLogs" :key="log.userFoodId" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-red/10 flex items-center justify-center text-2xl">
                  🥗
                </div>
                <div>
                  <p class="font-bold text-soft-black">{{ log.foodName }}</p>
                  <p class="text-xs text-gray-400">x{{ log.quantity }} 인분</p>
                </div>
              </div>
              
              <div class="flex items-center gap-4">
                 <span class="font-bold text-gray-500">{{ (log.calory * log.quantity).toFixed(0) }} kcal</span>
                 <div class="flex gap-2">
                    <button @click="startEdit('diet', log)" class="text-gray-400 hover:text-pastel-red transition-colors font-bold text-sm">수정</button>
                    <button @click="openDeleteModal('diet', log.userFoodId, log.foodName)" class="text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">삭제</button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workout Tab -->
        <div v-if="activeTab === 'workout'" class="animate-fade-in space-y-8">
          <!-- Add Form -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-yellow/20">
            <h3 class="text-xl font-bold text-pastel-yellow mb-4 flex items-center gap-2">
              <span>💪</span> 근력 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select v-model="workoutForm.muscleExerciseId" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow md:col-span-2">
                <option value="" disabled>운동 종목을 선택하세요</option>
                <option v-for="ex in muscleExercises" :key="ex.muscleExerciseId" :value="ex.muscleExerciseId">
                  [{{ ex.part }}] {{ ex.name }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <input v-model="workoutForm.setCount" type="number" placeholder="세트 (Set)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
              <input v-model="workoutForm.repsPerSet" type="number" placeholder="회 (Reps)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
              <input v-model="workoutForm.weight" type="number" placeholder="무게 (kg)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
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
            <div v-for="log in filteredWorkoutLogs" :key="log.muscleLogId" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-yellow/10 flex items-center justify-center text-2xl">
                  🏋️
                </div>
                <div>
                  <span class="text-xs font-bold text-pastel-yellow bg-pastel-yellow/10 px-2 py-1 rounded-full">{{ log.exercisePart }}</span>
                  <p class="font-bold text-soft-black mt-1">{{ log.exerciseName }}</p>
                </div>
              </div>
              <div class="text-right text-sm text-gray-500">
                <div class="flex gap-4 justify-end items-center">
                    <div>
                        <p class="font-bold text-gray-800 text-lg">
                          {{ log.setCount }}<span class="text-xs text-gray-400">set</span> x 
                          {{ log.repsPerSet }}<span class="text-xs text-gray-400">회</span> x 
                          {{ log.weight || 0 }}<span class="text-xs text-gray-400">kg</span>
                        </p>
                        <p class="text-xs text-pastel-red mt-1 font-bold">Total: {{ log.totalVolume?.toLocaleString() || 0 }} kg</p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="startEdit('workout', log)" class="text-gray-400 hover:text-pastel-blue transition-colors font-bold text-sm">수정</button>
                        <button @click="openDeleteModal('workout', log.muscleLogId, log.exerciseName)" class="text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">삭제</button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Running Tab -->
        <div v-if="activeTab === 'running'" class="animate-fade-in space-y-8">
          <!-- Add Form -->
          <div class="bg-cream/50 p-6 rounded-2xl border border-pastel-blue/20">
            <h3 class="text-xl font-bold text-pastel-blue mb-4 flex items-center gap-2">
              <span>🏃</span> 유산소 기록하기
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select v-model="runningForm.cardioExerciseId" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue">
                <option value="" disabled>운동 종목 선택</option>
                <option v-for="ex in cardioExercises" :key="ex.cardioExerciseId" :value="ex.cardioExerciseId">
                  {{ ex.name }}
                </option>
              </select>
              <input v-model="runningForm.durationMinutes" type="number" placeholder="운동 시간 (분)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
              <input v-model="runningForm.burnedKcal" type="number" placeholder="소모 칼로리 (kcal)" class="p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
            </div>
            <button @click="addRunningLog" class="w-full mt-4 bg-pastel-blue text-white py-3 rounded-xl font-bold hover:bg-pastel-blue/90 transition-colors shadow-sm active:scale-95 transform transition-transform">
              등록하기
            </button>
          </div>

          <!-- Log List -->
          <div class="space-y-4">
            <div v-if="filteredRunningLogs.length === 0" class="text-center py-10 text-gray-400">
              <p class="mb-2">👟</p>
              기록된 러닝이 없습니다.
            </div>
            <div v-for="log in filteredRunningLogs" :key="log.cardioLogId" class="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-pastel-blue/10 flex items-center justify-center text-2xl">
                  👟
                </div>
                <div>
                  <p class="font-bold text-soft-black">{{ log.exerciseName }}</p>
                  <p class="text-xs text-gray-400">{{ formattedSelectedDate }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex gap-4 justify-end items-center">
                    <div>
                        <p class="font-bold text-pastel-blue text-lg">{{ log.durationMinutes }}분</p>
                        <p class="text-xs text-gray-500">{{ log.burnedKcal }} kcal</p>
                    </div>
                    <div class="flex gap-2">
                        <button @click="startEdit('running', log)" class="text-gray-400 hover:text-pastel-yellow transition-colors font-bold text-sm">수정</button>
                        <button @click="openDeleteModal('running', log.cardioLogId, log.exerciseName)" class="text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">삭제</button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      <!-- Bottom Edit Panel -->
      <div 
        v-if="isEditing" 
        class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-t-3xl z-50 transform transition-transform duration-300"
      >
        <div class="max-w-4xl mx-auto p-6 md:p-8">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-bold text-soft-black">✏️ 기록 수정하기</h3>
                <button @click="cancelEdit" class="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
            </div>

            <!-- Diet Edit Form (with Food Search) -->
             <div v-if="editingType === 'diet'" class="space-y-4">
                <!-- Editable Food Search -->
                <div class="relative">
                    <label class="block text-sm font-bold text-gray-500 mb-2">음식 변경 (검색)</label>
                    <input 
                      v-model="editFoodSearchQuery" 
                      @input="searchEditFood" 
                      placeholder="다른 음식으로 변경하려면 검색하세요" 
                      class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red" 
                    />
                    <!-- Search Results Dropdown -->
                    <div v-if="editFoodSearchResults.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <div 
                        v-for="food in editFoodSearchResults" 
                        :key="food.foodId" 
                        @click="selectEditFood(food)"
                        class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        <p class="font-medium text-soft-black">{{ food.foodName }}</p>
                        <p class="text-xs text-gray-400">{{ food.calory }} kcal (100g 기준)</p>
                      </div>
                    </div>
                </div>
                
                <!-- Selected/Current Food Display -->
                <div class="p-4 bg-pastel-red/10 rounded-xl">
                    <p class="text-gray-500 text-sm mb-1">현재 선택된 음식</p>
                    <p class="text-xl font-bold text-pastel-red">{{ editDietForm.foodName }}</p>
                    <p class="text-sm text-gray-400">{{ editDietForm.calory }} kcal (100g)</p>
                </div>
                
                <div>
                     <label class="block text-sm font-bold text-gray-500 mb-2">수량 (인분)</label>
                     <input v-model="editDietForm.quantity" type="number" step="0.1" min="0.1" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red font-bold text-lg" />
                </div>
                <button @click="handleUpdateDiet" class="w-full bg-pastel-red text-white py-4 rounded-xl font-bold text-lg hover:bg-pastel-red/90 transition-colors shadow-md">
                    수정 완료
                </button>
             </div>

             <!-- Workout Edit Form -->
             <div v-if="editingType === 'workout'" class="space-y-4">
                 <div class="grid grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-500 mb-2">세트 (Set)</label>
                        <input v-model="editWorkoutForm.setCount" type="number" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-500 mb-2">회 (Reps)</label>
                        <input v-model="editWorkoutForm.repsPerSet" type="number" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-500 mb-2">무게 (kg)</label>
                        <input v-model="editWorkoutForm.weight" type="number" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-yellow" />
                    </div>
                 </div>
                 <button @click="handleUpdateWorkout" class="w-full bg-pastel-yellow text-white py-4 rounded-xl font-bold text-lg hover:bg-pastel-yellow/90 transition-colors shadow-md">
                    수정 완료
                 </button>
             </div>

             <!-- Running Edit Form -->
             <div v-if="editingType === 'running'" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-500 mb-2">운동 시간 (분)</label>
                        <input v-model="editRunningForm.durationMinutes" type="number" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-500 mb-2">소모 칼로리 (kcal)</label>
                        <input v-model="editRunningForm.burnedKcal" type="number" class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-blue" />
                    </div>
                 </div>
                 <button @click="handleUpdateRunning" class="w-full bg-pastel-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-pastel-blue/90 transition-colors shadow-md">
                    수정 완료
                 </button>
             </div>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <DeleteConfirmModal
        :visible="showDeleteModal"
        :date="deleteTarget.date"
        :item-name="deleteTarget.name"
        :item-type="deleteTarget.type"
        @confirm="confirmDelete"
        @cancel="cancelDeleteModal"
      />

    </template>
  </MainLayout>
</template>
