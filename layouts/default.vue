<script setup>
// 這整串也可以寫在各個page裡，就可以去設定不同頁面body的classname
useHead({
    title: '问题提问',
    meta: [
        { name: 'description', content: 'Question_Ask'},
        { name: 'keywords', content: 'Question_Ask'},
    ],
    bodyAttrs: {// 設定body的classname
        class: 'toby'
    },
});
</script>

<template>
  <slot />
</template>

<style scoped></style>
