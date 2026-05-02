<script setup lang="ts">
import { ref, computed } from 'vue'
import skillsData from './data/skills.json'

interface Skill {
  id: string;
  name: string;
  description_en: string;
  description_zh: string;
  category_en: string;
  category_zh: string;
}

const skills = ref<Skill[]>(skillsData as any)
const isEnglish = ref(false)
const selectedCategory = ref('全部')
const searchQuery = ref('')
const activeSkill = ref<Skill | null>(null)
const visibleLimit = ref(40) // Performance: Only show 40 items initially

const categories = computed(() => {
  const key = isEnglish.value ? 'category_en' : 'category_zh'
  const cats = new Set(skills.value.map(s => s[key] || (isEnglish.value ? 'General' : '通用技能')))
  return [isEnglish.value ? 'All' : '全部', ...Array.from(cats).sort()]
})

const filteredSkills = computed(() => {
  const q = searchQuery.value.toLowerCase()
  const cat = selectedCategory.value
  const isAll = cat === '全部' || cat === 'All'

  return skills.value.filter(s => {
    const sCat = isEnglish.value ? s.category_en : s.category_zh
    const matchesCat = isAll || sCat === cat
    const desc = isEnglish.value ? s.description_en : s.description_zh
    const matchesSearch = s.name.toLowerCase().includes(q) ||
      (desc && desc.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
    return matchesCat && matchesSearch
  })
})

const displayedSkills = computed(() => {
  return filteredSkills.value.slice(0, visibleLimit.value)
})

const loadMore = () => {
  visibleLimit.value += 40
}

const selectSkill = (skill: Skill) => {
  activeSkill.value = skill
}

const closeModal = () => {
  activeSkill.value = null
}

const toggleLanguage = () => {
  isEnglish.value = !isEnglish.value
  selectedCategory.value = isEnglish.value ? 'All' : '全部'
  visibleLimit.value = 40 // Reset limit on language switch
}
</script>

<template>
  <div class="container">
    <header>
      <div class="top-nav">
        <button @click="toggleLanguage" class="lang-toggle glass-btn">
          {{ isEnglish ? '切换至中文' : 'Switch to English' }}
        </button>
      </div>
      <h1>{{ isEnglish ? 'Antigravity Skills' : 'Antigravity 技能导航' }}</h1>
      <p class="subtitle">{{ isEnglish ? 'Explore 1,400+ expert AI skills to power your workflow' : '探索 1,400+ 专业 AI 技能，为你的工作流注入强大动力' }}</p>
      
      <div class="setup-notice">
        <div class="notice-content">
          <span class="icon">🚀</span>
          <p v-if="!isEnglish">
            <b>快速开始：</b>在终端运行 <code>npx antigravity-awesome-skills</code> 安装技能库后即可使用 <code>@技能ID</code> 调用。
          </p>
          <p v-else>
            <b>Quick Start:</b> Run <code>npx antigravity-awesome-skills</code> to install and use <code>@skill-id</code> in your AI.
          </p>
        </div>
      </div>

      <div class="controls">
        <div class="search-box">
          <input v-model="searchQuery" type="text" :placeholder="isEnglish ? 'Search skills...' : '搜索技能...'"
            class="glass-input" @input="visibleLimit = 40" />
        </div>
        <div class="category-filters">
          <button v-for="cat in categories" :key="cat" :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat; visibleLimit = 40" class="filter-btn">
            {{ cat }}
          </button>
        </div>
      </div>
    </header>

    <main class="skills-grid">
      <div v-for="skill in displayedSkills" :key="skill.id" class="skill-card glass-card" @click="selectSkill(skill)">
        <div class="category-tag">{{ isEnglish ? skill.category_en : skill.category_zh }}</div>
        <h3>{{ skill.name }}</h3>
        <p>{{ isEnglish ? skill.description_en : skill.description_zh }}</p>
        <div class="card-footer">
          <span class="id-tag">@{{ skill.id }}</span>
          <span class="more-link">{{ isEnglish ? 'Details →' : '查看详情 →' }}</span>
        </div>
      </div>
    </main>

    <div v-if="visibleLimit < filteredSkills.length" class="load-more-container">
      <button @click="loadMore" class="glass-btn load-more-btn">
        {{ isEnglish ? 'Load More' : '加载更多' }} ({{ filteredSkills.length - visibleLimit }} {{ isEnglish ? 'remaining' :
        '项待加载' }})
      </button>
    </div>

    <!-- Detailed Modal -->
    <Transition name="fade">
      <div v-if="activeSkill" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card">
          <button class="close-btn" @click="closeModal">×</button>
          <div class="modal-header">
            <span class="category-tag">{{ activeSkill.category }}</span>
            <h2>{{ activeSkill.name }}</h2>
            <code class="skill-id">@{{ activeSkill.id }}</code>
          </div>
          <div class="modal-body">
            <h3>{{ isEnglish ? 'Description' : '技能描述' }}</h3>
            <p>{{ isEnglish ? activeSkill.description_en : activeSkill.description_zh }}</p>
            <div class="usage-box">
              <h4>{{ isEnglish ? 'How to use' : '如何使用' }}</h4>
              <p v-if="!isEnglish">在你的 AI 助手中输入 <code>@{{ activeSkill.id }}</code> 即可激活此技能。</p>
              <p v-else>Type <code>@{{ activeSkill.id }}</code> in your AI assistant to activate this skill.</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="site-footer">
      <p>&copy; 2026 Antigravity 技能导航中心. 助力高效开发.</p>
    </footer>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

.subtitle {
  color: #888;
  font-size: 1.2rem;
  margin-top: -1rem;
  margin-bottom: 2rem;
}

.setup-notice {
  margin: 0 auto 3rem;
  max-width: 800px;
  background: rgba(100, 108, 255, 0.05);
  border: 1px solid rgba(100, 108, 255, 0.2);
  border-radius: 12px;
  padding: 1rem 2rem;
}

.notice-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.notice-content p {
  margin: 0;
  color: #ccc;
  font-size: 0.95rem;
  text-align: left;
}

.notice-content b {
  color: #646cff;
}

.notice-content code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: #ff4646;
  font-family: monospace;
}

.icon {
  font-size: 1.5rem;
}

.controls {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.glass-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.8rem 1.5rem;
  color: white;
  width: 400px;
  max-width: 90vw;
  font-size: 1rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.top-nav {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #888;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(100, 108, 255, 0.5);
}

.filter-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #aaa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background: #646cff;
  color: white;
  border-color: #646cff;
}

/* Removed duplicate .skills-grid */

.skill-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.category-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #646cff;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

h3 {
  margin: 0.5rem 0;
  font-size: 1.25rem;
}

p {
  color: #aaa;
  font-size: 0.9rem;
  line-height: 1.6;
  flex-grow: 1;
}

.card-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.id-tag {
  color: #444;
  font-family: monospace;
}

.more-link {
  color: #646cff;
  font-weight: 500;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  padding: 3rem;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  background: none;
  border: none;
  color: #666;
}

.skill-id {
  display: block;
  background: #111;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  margin: 1rem 0;
  color: #646cff;
}

.usage-box {
  background: rgba(100, 108, 255, 0.1);
  border: 1px solid rgba(100, 108, 255, 0.2);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.usage-box h4 {
  margin-top: 0;
  color: #646cff;
}

code {
  color: #ff4646;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.site-footer {
  text-align: center;
  margin-top: 5rem;
  padding: 2rem;
  color: #444;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  margin-bottom: 2rem;
}

.load-more-btn {
  padding: 0.8rem 2rem;
  font-size: 1rem;
  color: #646cff;
  border-color: rgba(100, 108, 255, 0.3);
}

.load-more-btn:hover {
  background: rgba(100, 108, 255, 0.1);
}
</style>
