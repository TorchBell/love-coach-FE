<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { storeToRefs } from 'pinia'
import tomaStamp from '@/assets/stamp/toma.jpg'
import belleStamp from '@/assets/stamp/belle.jpg'
import chiiStamp from '@/assets/stamp/chii.jpg'

const logStore = useLogStore()
const { selectedDate, calendarLogStatus } = storeToRefs(logStore)

const currentDate = ref(new Date())

// 초기화 확인용 플래그
const isReady = ref(false)

onMounted(async () => {
    // 안전하게 날짜 초기화 확인
    if (!currentDate.value) currentDate.value = new Date()
    if (logStore) {
        logStore.setSelectedDate(new Date())
        await fetchLogs()
    }
    isReady.value = true
})

const fetchLogs = async () => {
    if (!currentDate.value) return;
    try {
        await logStore.fetchMonthlyLogs(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
    } catch (e) {
        console.error(e)
    }
}

// 월 변경 감지
watch(currentDate, () => {
    fetchLogs()
}, { deep: true })

const currentMonthName = computed(() => {
  if (!currentDate.value) return ''
  return `${currentDate.value.getFullYear()}년 ${currentDate.value.getMonth() + 1}월`
})

// 날짜 계산 (안전하게 처리)
const monthlyCalendarDays = computed(() => {
    if (!currentDate.value) return []
    
    const year = currentDate.value.getFullYear()
    const month = currentDate.value.getMonth()
    
    // 해당 월의 1일의 요일 (0:일 ~ 6:토)
    const firstDay = new Date(year, month, 1).getDay()
    // 해당 월의 마지막 날짜
    const lastDate = new Date(year, month + 1, 0).getDate()
    
    const days = []
    // 빈 칸 추가
    for (let i = 0; i < firstDay; i++) {
        days.push({ date: null, id: `empty-${i}` })
    }
    // 날짜 추가
    for (let i = 1; i <= lastDate; i++) {
        days.push({ date: i, id: `day-${i}` })
    }
    return days
})

const isSelected = (day) => {
  if (!day || !selectedDate.value) return false
  try {
      const checkDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
      return checkDate.toDateString() === selectedDate.value.toDateString()
  } catch (e) { return false }
}

const isToday = (day) => {
    if (!day) return false
    try {
        const checkDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
        const today = new Date()
        return checkDate.toDateString() === today.toDateString()
    } catch (e) { return false }
}

const isFuture = (day) => {
    if (!day) return false
    try {
        const checkDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
        const today = new Date()
        // 시간 정보 제거 후 날짜만 비교
        checkDate.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        
        return checkDate > today
    } catch (e) { return false }
}

const selectDate = (day) => {
  if (!day) return
  const newDate = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
  logStore.setSelectedDate(newDate)
  // 현재 보고 있는 달력 날짜는 변경하지 않음
}

const formatDateString = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dayStr = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${dayStr}`
}

const getDailyLogs = (day) => {
  if (!day) return []
  try {
      const date = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), day)
      const dateStr = formatDateString(date)
      // calendarLogStatus가 없을 경우 대비
      return (calendarLogStatus.value && calendarLogStatus.value[dateStr]) || []
  } catch (e) { return [] }
}

const prevMonth = () => {
    if (!currentDate.value) return
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}
const nextMonth = () => {
    if (!currentDate.value) return
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}
const goToToday = () => {
    const today = new Date()
    logStore.setSelectedDate(today)
    currentDate.value = today
    fetchLogs()
}
</script>

<template>
  <div class="h-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[500px]">
    <!-- 헤더 영역 -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-3">
        <h3 class="text-2xl font-bold text-soft-black flex items-center gap-2 select-none">
            {{ currentMonthName }}
        </h3>
        <button 
            @click="goToToday"
            class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
        >
            Today
        </button>
      </div>

      <div class="flex gap-2">
          <button @click="prevMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-xl font-bold">
              ◀
          </button>
          <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 text-xl font-bold">
              ▶
          </button>
      </div>
    </div>

    <!-- 요일 헤더 -->
    <div class="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2 shrink-0">
        <div v-for="day in ['일','월','화','수','목','금','토']" :key="day" class="text-center text-sm font-bold text-gray-400">
            {{ day }}
        </div>
    </div>

    <!-- 날짜 그리드 -->
    <div class="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
        <div 
          v-for="item in monthlyCalendarDays" 
          :key="item.id"
          class="relative w-full h-full min-h-[80px]" 
        >
            <!-- 날짜 셀 -->
            <div 
                v-if="item.date"
                @click="!isFuture(item.date) && selectDate(item.date)"
                class="absolute inset-0 rounded-2xl border-2 transition-all duration-200 overflow-hidden"
                :class="[
                  isSelected(item.date) 
                    ? 'border-pastel-red bg-pastel-red/5 z-10' 
                    : (isFuture(item.date) ? 'cursor-not-allowed opacity-30 bg-gray-50' : 'cursor-pointer border-transparent hover:bg-gray-50 hover:border-gray-200'),
                  isToday(item.date) ? 'ring-2 ring-pastel-blue/30' : ''
                ]"
            >
                <!-- 1. 날짜 숫자: 절대 위치로 고정 -->
                <div class="absolute top-2 left-3 z-[100]">
                    <span 
                        class="text-lg font-bold block leading-none"
                        :class="isSelected(item.date) ? 'text-pastel-red' : 'text-gray-900'"
                    >
                        {{ item.date }}
                    </span>
                </div>
                
                <!-- 2. 스탬프 영역: 전체 채우기 -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-1">
                   <!-- 식단 -->
                   <img v-if="getDailyLogs(item.date).includes('diet')" :src="tomaStamp" 
                        class="absolute w-[34px] h-[34px] object-cover rounded-full border border-white shadow-sm transform -rotate-12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 opacity-90" />
                   
                   <!-- 근력 (우측 하단) -->
                   <img v-if="getDailyLogs(item.date).includes('workout')" :src="belleStamp" 
                        class="absolute w-7 h-7 object-cover rounded-full border border-white shadow-sm transform rotate-12 bottom-1 right-1 z-20" />
                   
                   <!-- 유산소 (좌측 상단, 날짜 피해 배치) -->
                   <img v-if="getDailyLogs(item.date).includes('running')" :src="chiiStamp" 
                        class="absolute w-6 h-6 object-cover rounded-full border border-white shadow-sm transform -rotate-12 top-1 right-2 z-30" />
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* 안전한 렌더링을 위한 기본 스타일 */
</style>

<style scoped>
/* Scoped styles if needed */
</style>
