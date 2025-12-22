<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream/50 via-white to-pastel-red/10 relative overflow-hidden py-12">
    
    <!-- 배경 요소 -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pastel-red/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pastel-yellow/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>

    <!-- 카드 컨테이너 -->
    <div class="bg-white/80 backdrop-blur-xl px-8 py-10 md:px-12 md:py-12 rounded-3xl shadow-2xl w-full max-w-md border border-white/50 relative z-10 mx-4">
      
      <!-- 헤더 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pastel-red via-pastel-yellow to-pastel-blue bg-clip-text text-transparent mb-3">
          LoveCoach
        </h1>
        <h2 class="text-xl font-bold text-gray-800 mb-2">회원정보 수정</h2>
        <p class="text-sm text-gray-500">프로필 정보를 업데이트하세요</p>
      </div>

      <!-- 폼 -->
      <div class="space-y-5">
        
        <!-- 이메일 (변경 불가) -->
        <div class="group">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email (변경 불가)</label>
          <input 
            v-model="form.email" 
            type="email" 
            disabled
            class="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-2 border-gray-200 font-medium text-gray-400 cursor-not-allowed"
          />
        </div>
        
        <!-- 닉네임 -->
        <div class="group">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-pastel-red transition-colors">Nickname</label>
          <input 
            v-model="form.nickname" 
            type="text" 
            class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
            placeholder="Your Nickname"
          />
        </div>

        <!-- 성별 -->
        <div>
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Gender</label>
          <div class="flex gap-3">
            <label class="flex-1 cursor-pointer">
              <input v-model="form.gender" type="radio" value="M" name="gender" class="peer sr-only" />
              <div class="py-3 text-center rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-pastel-blue peer-checked:text-white peer-checked:border-pastel-blue transition-all font-bold text-gray-600 hover:border-pastel-blue/50">
                Male
              </div>
            </label>
            <label class="flex-1 cursor-pointer">
              <input v-model="form.gender" type="radio" value="F" name="gender" class="peer sr-only" />
              <div class="py-3 text-center rounded-xl border-2 border-gray-200 bg-white peer-checked:bg-pastel-red peer-checked:text-white peer-checked:border-pastel-red transition-all font-bold text-gray-600 hover:border-pastel-red/50">
                Female
              </div>
            </label>
          </div>
        </div>

        <!-- 생년월일 -->
        <div class="group">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-pastel-red transition-colors">Birth Date</label>
          <input 
            v-model="form.birthDate" 
            type="date" 
            class="w-full px-4 py-3.5 bg-white rounded-xl border-2 border-gray-200 focus:border-pastel-red focus:ring-4 focus:ring-pastel-red/10 focus:outline-none transition-all font-medium text-gray-700"
          />
        </div>

        <!-- 버튼 -->
        <div class="flex gap-3 mt-8">
          <button 
            @click="handleCancel" 
            class="flex-1 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all"
          >
            취소
          </button>
          <button 
            @click="handleSave" 
            :disabled="isLoading"
            class="flex-1 py-4 bg-gradient-to-r from-pastel-red via-pastel-yellow to-pastel-red text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  nickname: '',
  gender: 'M',
  birthDate: ''
})

const isLoading = ref(false)

onMounted(() => {
  // 현재 사용자 데이터 로드
  if (authStore.user) {
    form.value.email = authStore.user.email || ''
    form.value.nickname = authStore.user.name || ''
    form.value.gender = authStore.user.gender || 'M'
    form.value.birthDate = authStore.user.birthDate || ''
  }
})

const handleSave = async () => {
  if (!form.value.nickname) {
    alert('닉네임을 입력해주세요.')
    return
  }

  isLoading.value = true
  
  const success = await authStore.updateProfile({
    name: form.value.nickname, // Mapping nickname to name if backend expects 'name'
    gender: form.value.gender,
    birthDate: form.value.birthDate
  })
    
  isLoading.value = false
  
  if (success) {
    alert('회원정보가 수정되었습니다!')
    router.push('/mypage')
  } else {
    alert('회원정보 수정에 실패했습니다.')
  }
}

const handleCancel = () => {
  router.push('/mypage')
}
</script>
