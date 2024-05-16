<script setup>
const props = defineProps({
    page: {
        type: String,
        required: false,
    },
});
const { page } = props;
</script>

<template>
<h1>Header</h1>
<div class="header"></div>
</template>
