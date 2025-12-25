<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLogStore } from '@/stores/logStore'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/authApi'
import completeStampData from '@/assets/stamp/COMPLETE.png'
import userTokenIcon from '@/assets/icons/user-token.png'
import QuestCompletionModal from '@/components/QuestCompletionModal.vue'

const logStore = useLogStore()
const authStore = useAuthStore()

// 퀘스트 데이터 (Hardcoded structure, updated fields)
const quests = ref([
    { id: 1, title: '식단 등록 2회 하기', target: 2, current: 0, collected: false, type: 'diet', reward: 10 },
    { id: 2, title: '근력 운동 등록 1회 하기', target: 1, current: 0, collected: false, type: 'workout', reward: 10 },
    { id: 3, title: '유산소 운동 등록 1회 하기', target: 1, current: 0, collected: false, type: 'cardio', reward: 10 },
    { id: 4, title: '2500칼로리 미만 먹기', target: 1, current: 0, collected: false, type: 'diet', reward: 10 }, // target 1 confirms 'valid day'
])

const now = new Date()
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const storageKey = `daily_quest_status_${authStore.user?.userId || 'guest'}_v1`

const isAllCleared = ref(false)
const showCompletionModal = ref(false)

// 진행률 계산
const totalCount = computed(() => quests.value.length)
const collectedCount = computed(() => quests.value.filter(q => q.collected).length)
const totalProgress = computed(() => Math.round((collectedCount.value / totalCount.value) * 100))
const canAllClear = computed(() => collectedCount.value === totalCount.value)

// 퀘스트 진행상황 업데이트 (LogStore 기반)
const updateQuestProgress = () => {
    // 1. 식단 등록 2회
    const dietCount = logStore.filteredDietLogs.length
    quests.value[0].current = dietCount

    // 2. 근력 운동 1회
    const workoutCount = logStore.filteredWorkoutLogs.length
    quests.value[1].current = workoutCount

    // 3. 유산소 운동 1회
    const runningCount = logStore.filteredRunningLogs.length
    quests.value[2].current = runningCount

    // 4. 2500kcal 미만 먹기 (단, 기록이 1개라도 있어야 함)
    // logStore.dailyDietStats는 { 'YYYY-MM-DD': kcal } 형태
    const todayKcal = logStore.dailyDietStats[dateStr] || 0
    const hasDietLogs = dietCount > 0
    
    // 조건: 기록이 있고, 2500 미만이면 성공(1), 아니면 실패(0)
    if (hasDietLogs && todayKcal < 2500) {
        quests.value[3].current = 1
        quests.value[3].title = `2500kcal 미만 (${Math.round(todayKcal)}kcal)`
    } else if (hasDietLogs && todayKcal >= 2500) {
        quests.value[3].current = 0 // 실패
        quests.value[3].title = `2500kcal 초과 (${Math.round(todayKcal)}kcal)`
    } else {
        quests.value[3].current = 0
        quests.value[3].title = '2500kcal 미만 먹기'
    }
}

// 로컬 스토리지 로드
const loadProgress = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            if (parsed.date === dateStr) {
                parsed.quests.forEach(savedQuest => {
                    const quest = quests.value.find(q => q.id === savedQuest.id)
                    if (quest) {
                        quest.collected = savedQuest.collected
                    }
                })
                isAllCleared.value = parsed.isAllCleared || false
            } else {
                localStorage.removeItem(storageKey)
            }
        } catch (e) {
            console.error('Failed to load quest status', e)
        }
    }
}

// 로컬 스토리지 저장
const saveProgress = () => {
    const data = {
        date: dateStr,
        quests: quests.value.map(q => ({ id: q.id, collected: q.collected })),
        isAllCleared: isAllCleared.value
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
}

// 개별 퀘스트 완료 처리 (보상 지급)
const handleComplete = async (quest) => {
    if (quest.current >= quest.target && !quest.collected) {
        try {
            // 토큰 지급 API 호출
            await authApi.useCredit({
                amount: quest.reward, // +10 (Positive amount adds credit)
                description: `Daily Quest: ${quest.title}`
            })
            
            // 프론트엔드 스토어 업데이트
            if (authStore.user) {
                authStore.user.credit = (authStore.user.credit || 0) + quest.reward
            }

            quest.collected = true
            saveProgress()
            // alert(`퀘스트 완료! ${quest.reward} 토큰을 획득했습니다.`)
        } catch (err) {
            console.error('Core Reward Error:', err)
            // 백엔드가 불안정해도 UI상으로는 완료 처리 진행 (사용자 요청: "프론트에서만...")
            // 하지만 API 호출은 시도함. 실패 시에도 일단 완료 처리를 할지 고민이나, 
            // "프론트에서만 현재 가지고 있는 백 코들 가지고 구현" -> 백엔드가 있다면 써야함.
            // 에러가 나면 사용자에게 알리고 롤백하는게 정석이나, 데모용으로는 UI 업데이트 우선 가능.
            // 여기서는 에러 시 중단.
            alert('보상 지급 중 오류가 발생했습니다.')
        }
    }
}

// 전체 완료 처리
const handleAllClearClick = () => {
    if (!canAllClear.value || isAllCleared.value) return
    showCompletionModal.value = true
}

// 모달 닫힘(완료) 후 최종 보상 지급
const onModalCompleted = async () => {
    try {
        const bonusReward = 100
        await authApi.useCredit({
            amount: bonusReward, 
            description: 'Daily All Clear Bonus'
        })
        
        if (authStore.user) {
            authStore.user.credit = (authStore.user.credit || 0) + bonusReward
        }

        isAllCleared.value = true
        showCompletionModal.value = false
        saveProgress()
    } catch (err) {
        console.error('Bonus Reward Error:', err)
        alert('최종 보상 지급 중 오류가 발생했습니다.')
        showCompletionModal.value = false
    }
}

onMounted(async () => {
    // 오늘 날짜로 로그 확인
    logStore.setSelectedDate(now) 
    await logStore.fetchMonthlyLogs() // 데이터 로드
    
    updateQuestProgress()
    loadProgress()
})

// 로그 데이터 변경 감지하여 퀘스트 상태 업데이트
watch(() => [logStore.dietLogs, logStore.workoutLogs, logStore.runningLogs], () => {
    updateQuestProgress()
}, { deep: true })

</script>

<template>
  <div class="h-full w-full bg-[#fdfbf7] rounded-[2.5rem] border-[6px] border-[#e6e2d8] shadow-2xl relative overflow-hidden flex flex-col font-game p-6 md:p-10 transition-all duration-500 hover:shadow-3xl">
    <!-- Background Texture -->
    <div class="absolute inset-0 opacity-10 pointer-events-none" 
         style="background-image: radial-gradient(#d4c5a5 1px, transparent 1px); background-size: 20px 20px;"></div>

    <!-- Header Style: Tape & Title -->
    <div class="relative z-10 text-center mb-6 flex-shrink-0">
        <div class="inline-block relative w-full max-w-sm">
             <h2 class="text-3xl md:text-4xl font-black tracking-widest uppercase title-font text-gray-800 mb-2">Daily Quests</h2>
             <div class="h-4 bg-gray-200 w-full rounded-full mt-2 relative border-2 border-gray-300 overflow-visible">
                 <div class="absolute top-0 left-0 h-full bg-pastel-red rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,107,107,0.5)]" :style="{ width: `${totalProgress}%` }"></div>
                 <!-- Heart Icon Indicator -->
                 <div class="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-20" :style="{ left: `${totalProgress}%` }">
                     <span class="text-2xl md:text-3xl drop-shadow-md transform -translate-x-1/2 block transition-transform hover:scale-125">❤️</span>
                 </div>
             </div>
             <p class="text-right text-xs md:text-sm font-bold text-pastel-red mt-2">{{ totalProgress }}% COMPLETED</p>
        </div>
        <!-- Tape Decoration -->
        <div class="absolute -top-6 right-8 w-20 h-6 bg-yellow-100/50 rotate-12 backdrop-blur-sm border border-yellow-200 shadow-sm opacity-60"></div>
    </div>

    <!-- Quest List (Scrollable) -->
    <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar relative z-10 pr-2 pb-2">
        <div 
            v-for="quest in quests" 
            :key="quest.id"
            class="group bg-white border-2 border-dashed rounded-2xl p-3 md:p-4 relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            :class="quest.collected ? 'border-pastel-green bg-green-50/30' : (quest.current >= quest.target ? 'border-pastel-red' : 'border-gray-300')"
        >
            <!-- Pin Icon -->
            <div class="absolute -top-3 -right-2 text-xl drop-shadow-md transform transition-transform group-hover:rotate-12 z-20">📌</div>
            
            <div class="flex items-center gap-4">
                <!-- Reward Icon Box (Health Token) -->
                <div class="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner border-2 transition-colors relative bg-yellow-50 border-yellow-200">
                    <img :src="userTokenIcon" class="w-10 h-10 drop-shadow-sm opacity-90" />
                    <!-- Reward Amount Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="font-black text-yellow-700 text-sm drop-shadow-md">+{{ quest.reward }}</span>
                    </div>
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 text-lg md:text-xl mb-1 truncate leading-tight" 
                        :class="{ 'line-through text-gray-400 decoration-2 decoration-pastel-red': quest.collected }">
                        {{ quest.title }}
                    </h3>
                    <p v-if="quest.collected" class="text-xs text-pastel-green font-bold">✨ Mission Completed!</p>
                    <p v-else class="text-xs text-gray-400 font-bold">진행중...</p>
                </div>

                <!-- Action Button (Right) -->
                <div class="flex-shrink-0 flex items-center gap-2">
                    <!-- Progress Text -->
                    <span class="text-xs md:text-sm font-bold text-gray-500 font-mono">({{ quest.current }}/{{ quest.target }})</span>

                    <button 
                        @click="handleComplete(quest)"
                        :disabled="quest.current < quest.target || quest.collected"
                        class="px-4 py-1.5 md:px-5 md:py-2 rounded-xl font-black text-xs md:text-sm shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none min-w-[80px]"
                        :class="[
                            quest.collected 
                                ? 'bg-gray-200 text-gray-400 cursor-default' 
                                : (quest.current >= quest.target ? 'bg-pastel-red text-white hover:bg-red-400 hover:shadow-lg animate-pulse-slow' : 'bg-gray-100 text-gray-400')
                        ]"
                    >
                        {{ quest.collected ? '완료됨' : '완료' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- All Clear Section -->
        <div class="mt-6 pt-4 border-t-2 border-dashed border-gray-200">
            <div class="bg-white border-4 border-double border-pastel-red/50 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all"
                 :class="{ 'bg-pastel-red/5 ring-4 ring-pastel-red/20': canAllClear && !isAllCleared }">
                
                 <div class="flex flex-col">
                    <h3 class="font-black text-gray-800 text-lg md:text-xl">모든 퀘스트 완료하기</h3>
                    <span class="text-xs md:text-sm font-bold text-gray-500">
                        진행상황 ({{ collectedCount }}/{{ totalCount }}) +100
                    </span>
                 </div>

                 <button 
                    @click="handleAllClearClick"
                    :disabled="!canAllClear || isAllCleared"
                    class="px-6 py-3 rounded-xl font-black text-sm md:text-base shadow-lg transition-all transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    :class="[
                        isAllCleared
                            ? 'bg-gray-800 text-white cursor-default ring-2 ring-gray-600'
                            : (canAllClear 
                                ? 'bg-gradient-to-r from-pastel-red to-red-500 text-white hover:scale-105 hover:shadow-red-200 animate-bounce-subtle' 
                                : 'bg-gray-200 text-gray-400')
                    ]"
                 >
                    <span v-if="isAllCleared">COMPLETED</span>
                    <span v-else>완료하기</span>
                 </button>
            </div>
        </div>
    </div>

    <!-- MAIN COMPLETE STAMP (IMAGE) - Only shown if isAllCleared is true -->
    <div v-if="isAllCleared" class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none bg-white/20 backdrop-blur-[1px] animate-fade-in">
        <img 
            :src="completeStampData" 
            class="w-64 md:w-80 object-contain stamp-animation drop-shadow-2xl opacity-90" 
            alt="COMPLETE" 
        />
    </div>

    <!-- Completion Celebration Modal -->
    <QuestCompletionModal 
        :visible="showCompletionModal" 
        @close="showCompletionModal = false" 
        @completed="onModalCompleted"
    />

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');

.font-game {
    font-family: 'Jua', sans-serif;
}
.title-font {
    text-shadow: 2px 2px 0px rgba(0,0,0,0.1);
}
.stamp-animation {
    animation: stamp-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    opacity: 0;
    transform: scale(2) rotate(-12deg);
}

@keyframes stamp-bounce {
    0% { opacity: 0; transform: scale(2) rotate(-12deg); }
    100% { opacity: 0.9; transform: scale(1) rotate(-12deg); }
}

.animate-pulse-slow {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-bounce-subtle {
    animation: bounce-subtle 2s infinite;
}

@keyframes bounce-subtle {
    0%, 100% { transform: translateY(-3%); }
    50% { transform: translateY(3%); }
}

.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 9999px;
}
</style>
