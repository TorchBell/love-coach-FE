<script setup>
import { ref } from 'vue'
import MainLayout from '../layouts/MainLayout.vue'
import PhotoCard from '../components/PhotoCard.vue'

// Sidebar Items (Left)
const leftSidebarItems = ref([
  { id: 'diet', title: '식단 마스터', image: new URL('@/assets/images/gallery_diet.png', import.meta.url).href, description: '건강한 식단 기록' },
  { id: 'workout', title: '운동 챔피언', image: new URL('@/assets/images/belle.png', import.meta.url).href, description: '매일매일 득근!' },
  { id: 'body', title: '눈바디 변화', image: new URL('@/assets/images/toma.png', import.meta.url).href, description: '변해가는 내 모습' },
  { id: 'water', title: '수분 섭취', image: new URL('@/assets/images/gallery_diet.png', import.meta.url).href, description: '물 마시기 습관' },
])

// Sidebar Items (Right)
const rightSidebarItems = ref([
  { id: 'running', title: '러닝 레전드', image: new URL('@/assets/images/chie.png', import.meta.url).href, description: '바람을 가르며' },
  { id: 'shopping', title: '쇼핑', image: new URL('@/assets/images/belle.png', import.meta.url).href, description: '나를 위한 선물' },
  { id: 'achievement', title: '업적 달성', image: new URL('@/assets/images/toma.png', import.meta.url).href, description: '나의 트로피' },
  { id: 'journey', title: '나만의 여정', image: new URL('@/assets/images/chie.png', import.meta.url).href, description: '성장의 기록' },
])

const scrollToSection = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <MainLayout>
    <!-- Left Sidebar Content -->
    <template #left-sidebar>
      <PhotoCard
        v-for="item in leftSidebarItems"
        :key="item.id"
        :title="item.title"
        :image="item.image"
        :description="item.description"
        @click="scrollToSection(item.id)"
      />
    </template>

    <!-- Right Sidebar Content -->
    <template #right-sidebar>
      <PhotoCard
        v-for="item in rightSidebarItems"
        :key="item.id"
        :title="item.title"
        :image="item.image"
        :description="item.description"
        @click="scrollToSection(item.id)"
      />
    </template>

    <!-- Center Content (Scrollable Gallery) -->
    <template #default>
      <div class="space-y-12">
        <!-- Welcome Section -->
        <section class="text-center py-10">
          <h2 class="text-4xl font-bold text-soft-black mb-4 font-pixel">환영합니다!</h2>
          <p class="text-lg text-gray-600">오늘도 건강한 하루를 시작해볼까요?</p>
        </section>

        <!-- Gallery Sections -->
        <section id="diet" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-red mb-4">식단 마스터</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">식단 갤러리 준비중...</p>
          </div>
        </section>

        <section id="workout" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-yellow mb-4">운동 챔피언</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">운동 갤러리 준비중...</p>
          </div>
        </section>

        <section id="body" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-blue mb-4">눈바디 변화</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">눈바디 갤러리 준비중...</p>
          </div>
        </section>

         <section id="water" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-red mb-4">수분 섭취</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">수분 섭취 갤러리 준비중...</p>
          </div>
        </section>

         <section id="running" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-blue mb-4">러닝 레전드</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">러닝 갤러리 준비중...</p>
          </div>
        </section>

         <section id="shopping" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-yellow mb-4">쇼핑</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">쇼핑 갤러리 준비중...</p>
          </div>
        </section>

         <section id="achievement" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-red mb-4">업적 달성</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">업적 갤러리 준비중...</p>
          </div>
        </section>

         <section id="journey" class="min-h-[50vh] bg-white rounded-3xl p-8 shadow-sm">
          <h3 class="text-2xl font-bold text-pastel-blue mb-4">나만의 여정</h3>
          <div class="aspect-video bg-cream rounded-xl flex items-center justify-center">
            <p class="text-gray-400">여정 갤러리 준비중...</p>
          </div>
        </section>
      </div>
    </template>
  </MainLayout>
</template>
