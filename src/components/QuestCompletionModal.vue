<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import userTokenIcon from '@/assets/icons/user-token.png'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['close', 'completed'])

const videoRef = ref(null)
const timer = ref(null)
const containerRef = ref(null)

// 파티클 상태
const particles = ref([])

// 파티클 생성 함수
const createParticles = () => {
    particles.value = []
    const count = 30 // 파티클 개수
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const velocity = 5 + Math.random() * 10
        particles.value.push({
            id: i,
            x: 0,
            y: 0,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.8,
            opacity: 1
        })
    }
    animateParticles()
}

// 파티클 애니메이션 루프
let animationFrameId
const animateParticles = () => {
    let active = false
    particles.value.forEach(p => {
        if (p.opacity > 0) {
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.5 // Gravity
            p.rotation += 5
            p.opacity -= 0.02
            active = true
        }
    })
    
    if (active) {
        animationFrameId = requestAnimationFrame(animateParticles)
    }
}

// 닫기 핸들러
const handleClose = () => {
  if (timer.value) clearTimeout(timer.value)
  emit('close')
  emit('completed') // 닫힐 때 완료 처리
}

// 비디오 자동 재생 및 타이머 설정
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 6초 후 자동 닫힘
    timer.value = setTimeout(() => {
        handleClose()
    }, 6000)
    
    // 비디오 재생 시도
    nextTick(() => {
        if (videoRef.value) {
            videoRef.value.currentTime = 0
            videoRef.value.play().catch(e => console.log('Autoplay prevented:', e))
        }
        createParticles() // 파티클 발사 🚀
    })
    
  } else {
      if (timer.value) clearTimeout(timer.value)
      if (videoRef.value) videoRef.value.pause()
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      particles.value = []
  }
})

onUnmounted(() => {
    if (timer.value) clearTimeout(timer.value)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
        
        <!-- Main Container (Smaller card style with bounce) -->
        <div 
            ref="containerRef"
            class="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transform transition-all animate-bounce-in origin-center flex flex-col"
        >
            <!-- Particles Container (Absolute, Centered behind or on top) -->
             <div class="absolute top-1/2 left-1/2 w-0 h-0 z-50 pointer-events-none">
                <div v-for="p in particles" :key="p.id" 
                     class="absolute w-8 h-8 pointer-events-none"
                     :style="{ 
                         transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${p.scale})`,
                         opacity: p.opacity
                     }"
                >
                    <img :src="userTokenIcon" class="w-full h-full object-contain" />
                </div>
             </div>

            <!-- Top: Video Area -->
            <div class="w-full aspect-video bg-black relative">
                 <video 
                    ref="videoRef"
                    src="@/assets/liveScreen/toma-clear.mp4" 
                    class="w-full h-full object-cover"
                    autoplay 
                    playsinline
                    muted
                ></video>
                <!-- Close Button -->
                <button 
                    @click="handleClose"
                    class="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full p-2 transition-transform hover:scale-110 z-30"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <!-- Bottom: Text Area -->
            <div class="bg-gradient-to-b from-white to-gray-50 p-6 text-center space-y-2 relative overflow-hidden">
                 <!-- Background Effect -->
                 <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pastel-red via-red-400 to-pastel-red animate-shimmer"></div>

                 <h2 class="text-3xl font-black text-gray-800 font-game animate-bounce-subtle flex items-center justify-center gap-2">
                    🎉 QUEST CLEAR! 🎉
                 </h2>
                 <p class="text-gray-600 font-bold text-lg word-keep-all">
                    와~ 모든 퀘스트를 완료했어요!<br/>
                    <span class="text-pastel-red">Love Coach</span>가 당신을 응원합니다!
                 </p>
            </div>
        </div>
    </div>
  </Teleport>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Jua&display=swap');

.font-game {
    font-family: 'Jua', sans-serif;
}

.word-keep-all {
    word-break: keep-all;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

/* 팡팡 튀는 등장 애니메이션 */
.animate-bounce-in {
    animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes bounceIn {
    0% { transform: scale(0.3); opacity: 0; }
    50% { transform: scale(1.05); opacity: 1; }
    70% { transform: scale(0.9); }
    100% { transform: scale(1); }
}

.animate-bounce-subtle {
    animation: bounceSubtle 1s infinite alternate;
}

@keyframes bounceSubtle {
    from { transform: translateY(0); }
    to { transform: translateY(-5px); }
}

.animate-shimmer {
    background-size: 200% 100%;
    animation: shimmer 2s linear infinite;
}

@keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
