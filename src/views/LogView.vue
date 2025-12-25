<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import DeleteConfirmModal from '../components/DeleteConfirmModal.vue'
import LogSidebar from './log/LogSidebar.vue'
import LogCalendar from './log/LogCalendar.vue'
import LogDashboard from './log/LogDashboard.vue'
import { useRoute, useRouter } from 'vue-router'
import { LOG_IMAGES } from '@/assets/dummy/index.js'
import { useUiStore } from '@/stores/uiStore'
import { useLogStore } from '@/stores/logStore'
import { storeToRefs } from 'pinia'

// ... (기존 import 유지)

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
  muscleExercises,
  cardioExercises
} = storeToRefs(logStore)

const setActiveTab = (tabId) => {
  uiStore.setActiveTab(tabId)
  router.push({ query: { ...route.query, tab: tabId } })
}

watch(() => route.query.tab, (newTab) => {
  if (newTab && ['diet', 'workout', 'running'].includes(newTab)) {
    uiStore.setActiveTab(newTab)
  }
})

const hideSidebar = ref(false)

const handleResize = () => {
    // 1024px (lg) 미만이면 사이드바 숨김 (상단 배너 사용)
    hideSidebar.value = window.innerWidth < 1024
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)

  if (route.query.tab) {
    uiStore.setActiveTab(route.query.tab)
  }
  await logStore.fetchExercises()
  await logStore.fetchMonthlyLogs()
})

onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
})

// --- 기존 폼 상태 및 CRUD 로직 유지 ---
const dietForm = ref({ foodId: '', quantity: 1 })
const workoutForm = ref({ muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '', selectedPart: '' }) // selectedPart 추가
const runningForm = ref({ cardioExerciseId: '', durationMinutes: '', burnedKcal: '' })
const foodSearchQuery = ref('')
const foodSearchResults = ref([])
const selectedFood = ref(null)

// --- 근력운동 다중 드롭다운 논리 ---
const uniqueParts = computed(() => {
    const parts = new Set(muscleExercises.value.map(ex => ex.part || '기타'))
    return Array.from(parts).sort()
})

const filteredExercises = computed(() => {
    if (!workoutForm.value.selectedPart) return []
    return muscleExercises.value.filter(ex => (ex.part || '기타') === workoutForm.value.selectedPart)
})
// ------------------------------------

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
  }
}

const selectFood = (food) => {
  selectedFood.value = food
  dietForm.value.foodId = food.foodId
  foodSearchQuery.value = food.foodName
  foodSearchResults.value = []
}

// 등록 함수들 (기존 유지)
const addDietLog = async () => {
  if (!dietForm.value.foodId) {
    alert('음식을 선택해주세요.')
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
  if (!workoutForm.value.muscleExerciseId) return
  const success = await logStore.addWorkoutLog({ 
    muscleExerciseId: Number(workoutForm.value.muscleExerciseId),
    setCount: Number(workoutForm.value.setCount) || 1,
    repsPerSet: Number(workoutForm.value.repsPerSet) || 1,
    weight: Number(workoutForm.value.weight) || 0
  })
  if (success) workoutForm.value = { muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '', selectedPart: '' }
}

const addRunningLog = async () => {
  if (!runningForm.value.cardioExerciseId) return
  const success = await logStore.addRunningLog({ 
    cardioExerciseId: Number(runningForm.value.cardioExerciseId),
    durationMinutes: Number(runningForm.value.durationMinutes) || 0,
    burnedKcal: Number(runningForm.value.burnedKcal) || 0
  })
  if (success) runningForm.value = { cardioExerciseId: '', durationMinutes: '', burnedKcal: '' }
}

// 수정 모드 상태
const isEditing = ref(false)
const editTargetId = ref(null)
const editTargetType = ref('')

// 수정 시작 함수 (누락된 부분 복구)
const startEdit = (type, log) => {
    isEditing.value = true
    editTargetType.value = type
    
    // 폼에 기존 데이터 채우기
    if (type === 'diet') {
        editTargetId.value = log.userFoodId
        dietForm.value = {
            foodId: log.foodId, // 주의: API 응답에 foodId가 포함되어 있어야 함. 없다면 검색해서 채워야 할 수도 있음.
            quantity: log.quantity
        }
        foodSearchQuery.value = log.foodName // 검색창에 이름 표시
        selectedFood.value = { foodId: log.foodId, foodName: log.foodName } // 임시 객체
    } else if (type === 'workout') {
        editTargetId.value = log.muscleLogId
        
        // 운동 데이터 찾아서 part 설정
        const exercise = muscleExercises.value.find(e => e.muscleExerciseId === log.muscleExerciseId)
        
        workoutForm.value = {
            muscleExerciseId: log.muscleExerciseId,
            setCount: log.setCount,
            repsPerSet: log.repsPerSet,
            weight: log.weight,
            selectedPart: exercise ? (exercise.part || '기타') : '' // 부위 설정
        }
    } else if (type === 'running') {
        editTargetId.value = log.cardioLogId
        runningForm.value = {
            cardioExerciseId: log.cardioExerciseId, // 주의: API 응답 확인 필요
            durationMinutes: log.durationMinutes,
            burnedKcal: log.burnedKcal
        }
    }
}

// 수정 취소 함수
const cancelEdit = () => {
    isEditing.value = false
    editTargetId.value = null
    editTargetType.value = ''
    resetForms()
}

const resetForms = () => {
    dietForm.value = { foodId: '', quantity: 1 }
    workoutForm.value = { muscleExerciseId: '', weight: '', setCount: '', repsPerSet: '', selectedPart: '' }
    runningForm.value = { cardioExerciseId: '', durationMinutes: '', burnedKcal: '' }
    foodSearchQuery.value = ''
    selectedFood.value = null
}

// 수정 완료(업데이트) 함수
const updateDietLog = async () => {
    if (!editTargetId.value) return
    const success = await logStore.updateDietLog(editTargetId.value, {
        foodId: String(dietForm.value.foodId),
        quantity: Number(dietForm.value.quantity) || 1
    })
    if (success) cancelEdit()
}

const updateWorkoutLog = async () => {
    if (!editTargetId.value) return
    const success = await logStore.updateWorkoutLog(editTargetId.value, {
        muscleExerciseId: Number(workoutForm.value.muscleExerciseId),
        setCount: Number(workoutForm.value.setCount) || 1,
        repsPerSet: Number(workoutForm.value.repsPerSet) || 1,
        weight: Number(workoutForm.value.weight) || 0
    })
    if (success) cancelEdit()
}

const updateRunningLog = async () => {
    if (!editTargetId.value) return
    const success = await logStore.updateRunningLog(editTargetId.value, {
        cardioExerciseId: Number(runningForm.value.cardioExerciseId),
        durationMinutes: Number(runningForm.value.durationMinutes) || 0,
        burnedKcal: Number(runningForm.value.burnedKcal) || 0
    })
    if (success) cancelEdit()
}

// --- 삭제 모달 관련 로직 (복구) ---
const showDeleteModal = ref(false)
const deleteTarget = ref({ type: '', id: null, name: '', date: '' })

const openDeleteModal = (type, id, name) => {
  deleteTarget.value = { 
      type, 
      id, 
      name, 
      date: formattedSelectedDate.value || '' 
  }
  showDeleteModal.value = true
}

const confirmDelete = async () => {
    const { type, id } = deleteTarget.value
    let success = false
    try {
        if (type === 'diet') await logStore.deleteDietLog(id) // API 호출은 store에서 처리한다고 가정
        else if (type === 'workout') await logStore.deleteWorkoutLog(id)
        else if (type === 'running') await logStore.deleteRunningLog(id)
    } catch(e) { 
        console.error('Delete failed', e) 
    } finally { 
        showDeleteModal.value = false 
        // 삭제 후 목록 갱신 필요 시 호출 (store에서 처리된다면 생략 가능)
        await logStore.fetchMonthlyLogs()
    }
}

const cancelDeleteModal = () => {
    showDeleteModal.value = false
}

</script>

<template>
  <MainLayout :is-full-width="true" :hide-sidebar="hideSidebar">
    
    <!-- 좌측 사이드바 (PC 전용) -->
    <template #left-sidebar>
      <div class="hidden lg:block h-full">
        <LogSidebar 
            :active-tab="activeTab" 
            @update:activeTab="setActiveTab"
        />
      </div>
    </template>

    <!-- 메인 콘텐츠 영역 -->
    <div class="space-y-6 min-h-screen pb-32"> <!-- 하단 여백 추가 (오버레이 고려) -->
      
      <!-- 상단 배너형 탭 메뉴 (lg 미만에서 표시) -->
      <div class="block lg:hidden h-40">
        <LogSidebar 
            :active-tab="activeTab" 
            @update:activeTab="setActiveTab"
        />
      </div>

      <!-- 상단 Grid: [좌: 입력+목록] [우: 달력] -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        
        <!-- 좌측 칼럼: 입력 폼 + 상세 목록 -->
        <div class="flex flex-col gap-6">
          
          <!-- 1. 기록 입력 폼 (등록 전용) -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-soft-black flex items-center gap-2 mb-4">
               <span v-if="activeTab === 'diet'">식단 등록</span>
               <span v-else-if="activeTab === 'workout'">근력 등록</span>
               <span v-else>유산소 등록</span>
            </h2>

            <!-- 식단 입력 폼 -->
            <div v-if="activeTab === 'diet'" class="space-y-4">
              <div class="relative">
                <input 
                  v-model="foodSearchQuery" 
                  @input="searchFood" 
                  placeholder="음식 검색 (예: 닭가슴살)" 
                  class="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pastel-red" 
                />
                <div v-if="foodSearchResults.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                   <div v-for="food in foodSearchResults" :key="food.foodId" @click="selectFood(food)" class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                      {{ food.foodName }} <span class="text-xs text-gray-400">({{ food.calory }}kcal)</span>
                   </div>
                </div>
              </div>
              <div class="flex gap-2">
                  <input v-model="dietForm.quantity" type="number" step="0.5" placeholder="수량" class="w-1/3 p-3 rounded-xl border border-gray-200" />
                  <button @click="addDietLog" class="flex-1 bg-pastel-red text-white rounded-xl font-bold hover:bg-pastel-red/90 transition-colors shadow-md transform active:scale-95">
                      등록하기
                  </button>
              </div>
              <div v-if="selectedFood" class="text-xs text-pastel-red font-bold">선택: {{ selectedFood.foodName }}</div>
            </div>

            <!-- 근력 입력 폼 (다중 드롭다운) -->
            <div v-if="activeTab === 'workout'" class="space-y-3">
               <!-- 1. 운동 부위 선택 -->
               <select v-model="workoutForm.selectedPart" class="w-full p-3 rounded-xl border border-gray-200">
                  <option value="" disabled>운동 부위 선택</option>
                  <option v-for="part in uniqueParts" :key="part" :value="part">{{ part }}</option>
               </select>

               <!-- 2. 상세 운동 선택 -->
               <select 
                  v-model="workoutForm.muscleExerciseId" 
                  class="w-full p-3 rounded-xl border border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                  :disabled="!workoutForm.selectedPart"
               >
                  <option value="" disabled>{{ workoutForm.selectedPart ? '상세 운동 선택' : '운동 부위를 먼저 선택하세요' }}</option>
                  <option v-for="ex in filteredExercises" :key="ex.muscleExerciseId" :value="ex.muscleExerciseId">{{ ex.name }}</option>
               </select>

               <div class="grid grid-cols-3 gap-2">
                  <input v-model="workoutForm.weight" placeholder="kg" type="number" class="p-3 rounded-xl border border-gray-200" />
                  <input v-model="workoutForm.setCount" placeholder="세트" type="number" class="p-3 rounded-xl border border-gray-200" />
                  <input v-model="workoutForm.repsPerSet" placeholder="회" type="number" class="p-3 rounded-xl border border-gray-200" />
               </div>
               <button @click="addWorkoutLog" class="w-full py-3 bg-pastel-blue text-white rounded-xl font-bold hover:bg-pastel-blue/90 shadow-md transform active:scale-95">
                   기록하기
               </button>
            </div>

            <!-- 유산소 입력 폼 -->
            <div v-if="activeTab === 'running'" class="space-y-3">
               <select v-model="runningForm.cardioExerciseId" class="w-full p-3 rounded-xl border border-gray-200">
                  <option value="" disabled>운동 선택</option>
                  <option v-for="ex in cardioExercises" :key="ex.cardioExerciseId" :value="ex.cardioExerciseId">{{ex.name}}</option>
               </select>
                  <input v-model="runningForm.durationMinutes" placeholder="분 (자동 칼로리 계산)" type="number" class="w-full p-3 rounded-xl border border-gray-200" />

               <button @click="addRunningLog" class="w-full py-3 bg-pastel-yellow text-white rounded-xl font-bold hover:bg-pastel-yellow/90 shadow-md transform active:scale-95">
                   기록하기
               </button>
            </div>
          </div>

          <!-- 2. 오늘의 기록 상세 목록 -->
          <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[300px]">
             <h3 class="font-bold text-gray-500 mb-4">오늘의 기록 상세</h3>
             
             <div class="flex-1 overflow-y-auto max-h-[400px] scrollbar-hide">
                 <!-- 식단 목록 -->
                 <div v-if="activeTab === 'diet'" class="space-y-2">
                    <div v-for="log in filteredDietLogs" :key="log.userFoodId" class="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                       <div class="flex items-center gap-2">
                           <div class="w-1 active-indicator bg-pastel-red h-8 rounded-full"></div>
                           <div class="flex flex-col">
                               <span class="font-bold text-sm text-soft-black">{{ log.foodName }}</span>
                               <span class="text-xs text-gray-500">{{ log.quantity }}개</span>
                           </div>
                       </div>
                       <div class="flex items-center gap-3">
                           <span class="font-bold text-pastel-red text-sm">{{ (log.calory * log.quantity).toFixed(0) }} kcal</span>
                           <div class="flex gap-1">
                              <button @click="startEdit('diet', log)" class="text-gray-400 hover:text-pastel-red transition-colors text-xs p-1 font-bold">수정</button>
                              <button @click="openDeleteModal('diet', log.userFoodId, log.foodName)" class="text-gray-400 hover:text-red-500 transition-colors text-xs p-1">삭제</button>
                           </div>
                       </div>
                    </div>
                    <p v-if="filteredDietLogs.length === 0" class="text-gray-400 text-center text-sm py-8">기록이 없습니다.</p>
                 </div>
                 
                 <!-- 근력 목록 -->
                 <div v-if="activeTab === 'workout'" class="space-y-2">
                     <div v-for="log in filteredWorkoutLogs" :key="log.muscleLogId" class="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                         <div class="flex items-center gap-2">
                             <div class="w-1 active-indicator bg-pastel-blue h-8 rounded-full"></div>
                             <div class="flex flex-col">
                                 <span class="font-bold text-sm text-soft-black">{{ log.exerciseName }}</span>
                                 <span class="text-xs text-gray-500">{{ log.weight }}kg / {{ log.setCount }}set</span>
                             </div>
                         </div>
                         <div class="flex items-center gap-1">
                            <button @click="startEdit('workout', log)" class="text-gray-400 hover:text-pastel-blue transition-colors text-xs p-1 font-bold">수정</button>
                            <button @click="openDeleteModal('workout', log.muscleLogId, log.exerciseName)" class="text-gray-400 hover:text-red-500 transition-colors text-xs p-1">삭제</button>
                         </div>
                     </div>
                     <p v-if="filteredWorkoutLogs.length === 0" class="text-gray-400 text-center text-sm py-8">기록이 없습니다.</p>
                 </div>
     
                 <!-- 유산소 목록 -->
                  <div v-if="activeTab === 'running'" class="space-y-2">
                     <div v-for="log in filteredRunningLogs" :key="log.cardioLogId" class="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                         <div class="flex items-center gap-2">
                             <div class="w-1 active-indicator bg-pastel-yellow h-8 rounded-full"></div>
                             <div class="flex flex-col">
                                 <span class="font-bold text-sm text-soft-black">{{ log.exerciseName }}</span>
                                 <span class="text-xs text-gray-500">{{ log.durationMinutes }}분</span>
                             </div>
                         </div>
                         <div class="flex items-center gap-3">
                             <span class="font-bold text-pastel-yellow text-sm">{{ log.burnedKcal }} kcal</span>
                             <div class="flex gap-1">
                                <button @click="startEdit('running', log)" class="text-gray-400 hover:text-pastel-yellow transition-colors text-xs p-1 font-bold">수정</button>
                                <button @click="openDeleteModal('running', log.cardioLogId, log.exerciseName)" class="text-gray-400 hover:text-red-500 transition-colors text-xs p-1">삭제</button>
                             </div>
                         </div>
                     </div>
                     <p v-if="filteredRunningLogs.length === 0" class="text-gray-400 text-center text-sm py-8">기록이 없습니다.</p>
                 </div>
             </div>
          </div>

        </div>

        <!-- 우측 칼럼: 캘린더 (높이 확보) -->
        <div class="col-span-1 h-[600px] lg:h-auto min-h-[600px]"> <!-- 높이 강제 지정하여 보이지 않는 문제 해결 -->
           <LogCalendar class="h-full w-full" />
        </div>
      </div>

      <!-- 구분선 -->
      <hr class="border-gray-100" />

      <!-- 하단: 대시보드 (전체 너비) -->
      <div>
        <!-- 타이틀은 대시보드 내부에서 렌더링 -->
        <LogDashboard :active-tab="activeTab" />
      </div>
    
    </div>
    


    <!-- 수정 오버레이 (Bottom Sheet) -->
    <div v-if="isEditing" class="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm transition-opacity" @click.self="cancelEdit">
        <div class="w-full max-w-4xl bg-white rounded-t-3xl shadow-2xl p-8 transform transition-transform duration-300 animate-slide-up border-t-4 border-pastel-red">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-black text-soft-black flex items-center gap-2">
                   기록 수정하기
                    <span class="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{{ editTargetType === 'diet' ? '식단' : editTargetType === 'workout' ? '근력' : '유산소' }}</span>
                </h2>
                <button @click="cancelEdit" class="p-2 hover:bg-gray-100 rounded-full transition-colors">❌</button>
            </div>

            <div class="space-y-6">
                <!-- 수정용 폼 (기존 폼과 유사하지만 더 큼직하게) -->
                
                <!-- 식단 수정 -->
                <div v-if="editTargetType === 'diet'" class="space-y-4">
                     <div class="relative">
                        <label class="block text-sm font-bold text-gray-700 mb-1">음식 검색</label>
                        <input 
                          v-model="foodSearchQuery" 
                          @input="searchFood" 
                          placeholder="음식 검색 (예: 닭가슴살)" 
                          class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-red text-lg font-bold" 
                        />
                        <div v-if="foodSearchResults.length > 0" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                           <div v-for="food in foodSearchResults" :key="food.foodId" @click="selectFood(food)" class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 flex justify-between items-center">
                              <span class="font-bold">{{ food.foodName }}</span>
                              <span class="text-sm text-gray-400">{{ food.calory }}kcal</span>
                           </div>
                        </div>
                     </div>
                     
                     <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-bold text-gray-700 mb-1">수량</label>
                            <input v-model="dietForm.quantity" type="number" step="0.5" class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-red text-lg font-bold" />
                        </div>
                     </div>
                     
                     <div v-if="selectedFood || dietForm.foodId" class="bg-pastel-red/10 p-4 rounded-xl text-pastel-red font-bold flex items-center gap-2">
                        <span>선택된 음식: {{ selectedFood ? selectedFood.foodName : foodSearchQuery }}</span>
                     </div>

                     <button @click="updateDietLog" class="w-full py-4 bg-pastel-red text-white rounded-xl text-xl font-bold hover:brightness-110 shadow-lg mt-4">
                        수정 완료
                     </button>
                </div>

                <!-- 근력 수정 -->
                <div v-if="editTargetType === 'workout'" class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-xl mb-2">
                         <span class="text-gray-500 text-sm">운동 종목:</span>
                         <select v-model="workoutForm.muscleExerciseId" class="w-full bg-transparent font-bold text-lg outline-none mt-1">
                             <option v-for="ex in muscleExercises" :key="ex.muscleExerciseId" :value="ex.muscleExerciseId">{{ex.name}}</option>
                         </select>
                     </div>
                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">무게 (kg)</label>
                            <input v-model="workoutForm.weight" type="number" class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-blue text-lg font-bold" />
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">세트 수</label>
                            <input v-model="workoutForm.setCount" type="number" class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-blue text-lg font-bold" />
                        </div>
                         <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">회수</label>
                            <input v-model="workoutForm.repsPerSet" type="number" class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-blue text-lg font-bold" />
                        </div>
                    </div>
                    <button @click="updateWorkoutLog" class="w-full py-4 bg-pastel-blue text-white rounded-xl text-xl font-bold hover:brightness-110 shadow-lg mt-4">
                        수정 완료
                     </button>
                </div>

                <!-- 유산소 수정 -->
                <div v-if="editTargetType === 'running'" class="space-y-4">
                     <div class="bg-gray-50 p-4 rounded-xl mb-2">
                         <span class="text-gray-500 text-sm">운동 종목:</span>
                         <select v-model="runningForm.cardioExerciseId" class="w-full bg-transparent font-bold text-lg outline-none mt-1">
                             <option v-for="ex in cardioExercises" :key="ex.cardioExerciseId" :value="ex.cardioExerciseId">{{ex.name}}</option>
                         </select>
                     </div>
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-1">시간 (분)</label>
                            <input v-model="runningForm.durationMinutes" type="number" placeholder="자동 칼로리 계산" class="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pastel-yellow text-lg font-bold" />
                        </div>
                    </div>
                     <button @click="updateRunningLog" class="w-full py-4 bg-pastel-yellow text-white rounded-xl text-xl font-bold hover:brightness-110 shadow-lg mt-4">
                        수정 완료
                     </button>
                </div>

            </div>
        </div>
    </div>

    <!-- 삭제 모달 -->
    <DeleteConfirmModal
        :visible="showDeleteModal"
        :date="deleteTarget && deleteTarget.date ? deleteTarget.date : ''"
        :item-name="deleteTarget && deleteTarget.name ? deleteTarget.name : ''"
        :item-type="deleteTarget && deleteTarget.type ? deleteTarget.type : 'diet'"
        @confirm="confirmDelete"
        @cancel="cancelDeleteModal"
      />
      
  </MainLayout>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
@keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
.animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
}
</style>
