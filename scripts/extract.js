import fs from 'fs';
import path from 'path';

const skillsRoot = 'D:/develop/.skills';
const outputPath = 'D:/develop/vue/antigravity-skills-nav/src/data/skills.json';

const translationMap = {
  "00-andruia-consultant": "Andru.ia 首席解决方案架构师与技术顾问。负责为西班牙语 AI 项目诊断并规划最佳路线图。",
  "007": "提供安全审计、加固、威胁建模（STRIDE/PASTA）、红蓝对抗、OWASP 检查、代码审计及事故响应等全方位基础设施安全服务。",
  "10-andruia-skill-smith": "Andru.ia 系统工程师。负责根据钻石标准在库中设计、编写和部署新的技能模块。",
  "20-andruia-niche-intelligence": "Andru.ia 领域情报策略师。分析项目的特定领域，注入独特的知识、法规和标准。",
  "android-jetpack-compose-expert": "构建现代 Android UI 的专家指南，涵盖状态管理、导航、性能优化和 Material Design 3。",
  "concise-planning": "在开始编码前强制进行任务规划，确保逻辑严密并减少返工。",
  "github-actions-templates": "提供各种 CI/CD 自动化脚本模版，用于 APK 构建、签名和部署。",
  "frontend-design": "提升网页美学效果，包含毛玻璃特效、渐变和响应式布局设计。",
  "security-auditor": "对代码进行全面的安全扫描，查找 XSS、注入及其他漏洞。",
  "lint-and-validate": "自动检查语法、规范和潜在逻辑错误，保证代码质量。",
  "systematic-debugging": "通过科学的假设与验证方法，系统性地修复复杂 Bug。",
  "git-pushing": "规范化 Git 提交记录，确保代码安全保存并符合团队规范。",
  "mobile-developer": "跨平台移动开发专家，处理原生权限、兼容性和应用发布。",
  "kotlin-coroutines-expert": "深度优化 Kotlin 异步任务、挂起函数和高性能数据流处理。",
  "app-store-optimization": "应用商店优化专家，提升下载量和关键词排名。",
  "seo-audit": "全面的搜索引擎优化审计，提高网站曝光率。",
  "docker-expert": "容器化部署专家，解决环境一致性和镜像优化问题。",
  "sql-pro": "高级 SQL 优化与数据库设计，处理复杂查询和性能调优。",
  "unit-testing-expert": "编写高质量单元测试，提升代码覆盖率和健壮性。",
  "api-security-best-practices": "保障 REST/GraphQL 接口安全的最佳实践指南。",
  "deployment-procedures": "规范化发布流程，降低上线风险并提升稳定性。",
  "readme-expert": "编写清晰、美观且专业的项目文档。",
  "vue-expert": "Vue.js 开发专家，精通 Composition API 和性能优化。",
  "react-patterns": "React 开发模式与性能优化，涵盖 Hooks、Context 等核心概念。",
  "python-backend-expert": "Python 后端开发专家，精通 Django, FastAPI 等框架。",
  "rust-programming-expert": "高性能 Rust 编程，内存安全与系统级优化。",
  "agent-orchestrator": "AI 智能体编排专家，构建复杂的多代理工作流系统。",
  "llm-prompt-engineer": "大语言模型提示词工程，优化输出质量与稳定性。"
};

async function translateText(text, id) {
  if (translationMap[id]) return translationMap[id];
  if (!text) return '';
  try {
    const url = `https://translate.google.com/m?hl=zh-CN&sl=en&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    });
    const html = await response.text();
    const match = html.match(/class="result-container">([^<]+)<\/div>/);
    return match ? match[1] : text;
  } catch (error) {
    console.error('Translation failed:', error);
    return text;
  }
}

async function extractInfo() {
  const dirs = fs.readdirSync(skillsRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && !['docs', 'scripts', 'node_modules', 'data', 'node_modules'].includes(dirent.name));

  let skills = [];
  console.log(`Found ${dirs.length} skills. Starting extraction...`);

  for (const dir of dirs) {
    const skillPath = path.join(skillsRoot, dir.name, 'SKILL.md');
    let name = dir.name;
    let descriptionEn = '';
    
    if (fs.existsSync(skillPath)) {
      const content = fs.readFileSync(skillPath, 'utf-8');
      
      // Try to parse YAML frontmatter
      const frontmatterMatch = content.match(/^---\r?\n([\s\S]+?)\r?\n---/);
      if (frontmatterMatch) {
        const yaml = frontmatterMatch[1];
        const nameMatch = yaml.match(/^name:\s*(.+)$/m);
        const descMatch = yaml.match(/^description:\s*["']?(.+?)["']?$/m);
        
        if (nameMatch) name = nameMatch[1].replace(/["']/g, '').trim();
        if (descMatch) descriptionEn = descMatch[1].trim();
      }

      // Fallback or secondary check if description is still empty
      if (!descriptionEn) {
        const lines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('#') && !l.trim().startsWith('---'));
        for (const line of lines) {
          if (line.length > 20 && !line.includes(': ')) { // Heuristic for actual sentences
            descriptionEn = line;
            break;
          }
        }
      }
    }
    
    const desc = (descriptionEn || name).substring(0, 150);
    skills.push({
      id: dir.name,
      name,
      description_en: desc,
      description_zh: desc, // Placeholder
      category: '通用技能'
    });
  }

  // Load existing data for caching
  let existingSkills = [];
  if (fs.existsSync(outputPath)) {
    try {
      existingSkills = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
    } catch (e) {}
  }

  // Batch translation
  const batchSize = 3;
  const separator = ' ###NEXT_SKILL### ';
  console.log(`Starting batch translation...`);
  
  for (let i = 0; i < skills.length; i += batchSize) {
    const batch = skills.slice(i, i + batchSize).filter(s => {
      // 1. 强制应用手动翻译表 (最高优先级)
      if (translationMap[s.id]) {
        s.description_zh = translationMap[s.id];
        return false;
      }
      
      // 2. 检查缓存
      const existing = existingSkills.find(es => es.id === s.id);
      if (existing && existing.description_zh && existing.description_zh !== existing.description_en && !existing.description_zh.includes('###')) {
        s.description_zh = existing.description_zh;
        return false;
      }
      return true;
    });

    if (batch.length === 0) continue;
    
    const combinedText = batch.map(s => s.description_en).join(separator);
    
    console.log(`Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(skills.length / batchSize)}...`);
    const translatedBlock = await translateText(combinedText);
    const translatedParts = translatedBlock.split('###NEXT_SKILL###');
    
    if (translatedParts.length === batch.length) {
      batch.forEach((skill, index) => {
        skill.description_zh = translatedParts[index].trim();
      });
    } else {
      console.warn(`Batch ${i} misalignment. Falling back to individual translation.`);
      for (const s of batch) {
        s.description_zh = await translateText(s.description_en);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 3500));
    
    if (Math.floor(i / batchSize) % 5 === 0) {
      updateMetadata(skills); // Ensure categories are updated
      fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2));
    }
  }

  updateMetadata(skills);
  fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2));
  console.log(`Extracted and translated ${skills.length} skills to ${outputPath}`);
}

function updateMetadata(skills) {
  skills.forEach(s => {
    const text = (s.id + ' ' + (s.description_en || '')).toLowerCase();
    
    if (text.includes('android') || text.includes('mobile') || text.includes('ios') || text.includes('react-native') || text.includes('flutter')) {
      s.category_zh = '移动开发'; s.category_en = 'Mobile';
    } else if (text.includes('web') || text.includes('react') || text.includes('vue') || text.includes('frontend') || text.includes('html') || text.includes('css') || text.includes('nextjs')) {
      s.category_zh = 'Web前端'; s.category_en = 'Web';
    } else if (text.includes('security') || text.includes('audit') || text.includes('pentest') || text.includes('hardening') || text.includes('attack') || text.includes('vulnerability') || text.includes('owasp') || s.id === '007') {
      s.category_zh = '安全审计'; s.category_en = 'Security';
    } else if (text.includes('ai') || text.includes('agent') || text.includes('llm') || text.includes('gpt') || text.includes('claude') || text.includes('machine learning') || text.includes('prompt')) {
      s.category_zh = '人工智能'; s.category_en = 'AI';
    } else if (text.includes('python') || text.includes('go') || text.includes('rust') || text.includes('backend') || text.includes('nodejs') || text.includes('api') || text.includes('database') || text.includes('sql')) {
      s.category_zh = '后端开发'; s.category_en = 'Backend';
    } else if (text.includes('devops') || text.includes('cloud') || text.includes('docker') || text.includes('kubernetes') || text.includes('aws') || text.includes('azure') || text.includes('cicd')) {
      s.category_zh = '运维部署'; s.category_en = 'DevOps';
    } else if (text.includes('seo') || text.includes('marketing') || text.includes('content') || text.includes('writing') || text.includes('business')) {
      s.category_zh = '运营增长'; s.category_en = 'Growth';
    } else {
      s.category_zh = '通用技能'; s.category_en = 'General';
    }
    
    // 强制应用手动翻译表
    if (translationMap[s.id]) {
      s.description_zh = translationMap[s.id];
    }
    
    delete s.category; // Ensure old field is gone
  });
}

extractInfo();
