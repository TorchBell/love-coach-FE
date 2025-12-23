<script setup>
import { ref, computed } from 'vue'
import completeStampData from '@/assets/stamp/COMPLETE.png'

const quests = ref([
    { id: 1, title: '식단 등록 2회 하기', target: 2, current: 2, collected: false, type: 'diet', icon: '🥗' },
    { id: 2, title: '근력 운동 등록 1회 하기', target: 1, current: 1, collected: false, type: 'workout', icon: '💪' },
    { id: 3, title: '유산소 운동 등록 1회 하기', target: 1, current: 1, collected: false, type: 'cardio', icon: '🏃‍♀️' },
    { id: 4, title: '2000칼로리 미만 먹기', target: 1, current: 1, collected: false, type: 'diet', icon: '📉' },
])

const now = new Date()
const dateStr = `${now.getMonth() + 1}/${now.getDate()}`
const storageKey = 'love_coach_daily_quest_status'

// 진행률은 '보상 수령(collected)' 기준
const totalProgress = computed(() => {
    const total = quests.value.length
    const collectedCount = quests.value.filter(q => q.collected).length
    return Math.round((collectedCount / total) * 100)
})

const isAllCollected = computed(() => totalProgress.value === 100)

// 로컬 스토리지 로드
const loadProgress = () => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            // 날짜가 같으면 상태 복원
            if (parsed.date === dateStr) {
                parsed.quests.forEach(savedQuest => {
                    const quest = quests.value.find(q => q.id === savedQuest.id)
                    if (quest) {
                        quest.collected = savedQuest.collected
                    }
                })
            } else {
                // 날짜가 다르면 리셋 (이미 collected: false로 초기화된 상태)
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
        quests: quests.value.map(q => ({ id: q.id, collected: q.collected }))
    }
    localStorage.setItem(storageKey, JSON.stringify(data))
}

const handleComplete = (quest) => {
    if (quest.current >= quest.target && !quest.collected) {
        quest.collected = true
        saveProgress()
    }
}

// 컴포넌트 마운트 시 로드 (onMounted import 필요)
import { onMounted } from 'vue'
onMounted(() => {
    loadProgress()
})
</script>

<template>
  <div class="h-full w-full bg-[#fdfbf7] rounded-[2.5rem] border-[6px] border-[#e6e2d8] shadow-2xl relative overflow-hidden flex flex-col font-game p-6 md:p-10 transition-all duration-500 hover:shadow-3xl">
    <!-- Background Texture -->
    <div class="absolute inset-0 opacity-10 pointer-events-none" 
         style="background-image: radial-gradient(#d4c5a5 1px, transparent 1px); background-size: 20px 20px;"></div>

    <!-- Header Style: Tape & Title -->
    <div class="relative z-10 text-center mb-8">
        <div class="inline-block relative w-full max-w-sm">
             <h2 class="text-4xl font-black tracking-widest uppercase title-font text-gray-800 mb-2">Daily Quests</h2>
             <div class="h-4 bg-gray-200 w-full rounded-full mt-2 relative border-2 border-gray-300 overflow-visible">
                 <div class="absolute top-0 left-0 h-full bg-pastel-red rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,107,107,0.5)]" :style="{ width: `${totalProgress}%` }"></div>
                 <!-- Heart Icon Indicator -->
                 <div class="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-20" :style="{ left: `${totalProgress}%` }">
                     <span class="text-3xl drop-shadow-md transform -translate-x-1/2 block transition-transform hover:scale-125">❤️</span>
                 </div>
             </div>
             <p class="text-right text-sm font-bold text-pastel-red mt-2">{{ totalProgress }}% COMPLETED</p>
        </div>
        <!-- Tape Decoration -->
        <div class="absolute -top-8 right-10 w-24 h-8 bg-yellow-100/50 rotate-12 backdrop-blur-sm border border-yellow-200 shadow-sm opacity-60"></div>
    </div>

    <!-- Quest List (Post-it / Board Layout) -->
    <div class="flex-1 overflow-y-auto space-y-5 custom-scrollbar relative z-10 pr-2 pb-4">
        <div 
            v-for="quest in quests" 
            :key="quest.id"
            class="group bg-white border-2 border-dashed rounded-2xl p-4 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            :class="quest.collected ? 'border-pastel-green bg-green-50/30' : (quest.current >= quest.target ? 'border-pastel-red' : 'border-gray-300')"
        >
            <!-- Pin Icon -->
            <div class="absolute -top-3 -right-2 text-2xl drop-shadow-md transform transition-transform group-hover:rotate-12 z-20">📌</div>
            
            <div class="flex items-center gap-5">
                <!-- Icon Box -->
                <div class="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl shadow-inner border-2 transition-colors relative"
                     :class="quest.current >= quest.target ? 'bg-orange-50 border-pastel-red text-orange-500' : 'bg-gray-100 border-gray-200 grayscale'">
                    {{ quest.icon }}
                    
                    <!-- Number Badge (Moved Left) -->
                    <div class="absolute -bottom-2 -right-2 bg-white border-2 border-gray-200 text-xs font-black px-2 py-0.5 rounded-full shadow-sm text-gray-500">
                        {{ quest.current }}/{{ quest.target }}
                    </div>
                </div>
                
                <!-- Content -->
                <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-gray-800 text-xl mb-1 truncate" 
                        :class="{ 'line-through text-gray-400 decoration-2 decoration-pastel-red': quest.collected }">
                        {{ quest.title }}
                    </h3>
                    <p v-if="quest.collected" class="text-xs text-pastel-green font-bold">✨ Mission Completed!</p>
                    <p v-else class="text-xs text-gray-400 font-bold">진행중...</p>
                </div>

                <!-- Action Button (Right) -->
                <div class="flex-shrink-0">
                    <button 
                        @click="handleComplete(quest)"
                        :disabled="quest.current < quest.target || quest.collected"
                        class="px-5 py-2 rounded-xl font-black text-sm shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        :class="[
                            quest.collected 
                                ? 'bg-gray-200 text-gray-400 cursor-default' 
                                : (quest.current >= quest.target ? 'bg-pastel-red text-white hover:bg-red-400 hover:shadow-lg animate-pulse-slow' : 'bg-gray-100 text-gray-400')
                        ]"
                    >
                        {{ quest.collected ? '완료됨' : '완료하기' }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MAIN COMPLETE STAMP (IMAGE) -->
    <div v-if="isAllCollected" class="absolute inset-0 flex items-center justify-center z-50 pointer-events-none bg-white/20 backdrop-blur-[1px] animate-fade-in">
        <img 
            :src="completeStampData" 
            class="w-64 md:w-80 object-contain stamp-animation drop-shadow-2xl opacity-90" 
            alt="COMPLETE" 
        />
    </div>

    <!-- Bottom Deco -->
    <div class="mt-4 pt-4 border-t-2 border-dashed border-gray-300 flex justify-between items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
        <span>{{ dateStr }} Mission</span>
        <span>Love Coach</span>
    </div>

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
.striped-bar {
    background-image: linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent);
    background-size: 1rem 1rem;
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
</style>
