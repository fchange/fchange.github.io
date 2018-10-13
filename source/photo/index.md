---
title: 相册
noDate: 'true'
---
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery_lazyload/1.9.7/jquery.lazyload.min.js"></script> -->
<script src="https://unpkg.com/minigrid@3.1.1/dist/minigrid.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.js"></script>
<link href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.css" rel="stylesheet">

<div class="ImageGrid"></div>

<script src="/js/photo.js"></script>

<style>
.ImageGrid {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  text-align: center;
  margin: : 20px 0;
}

.card {
  overflow: hidden;
  transition: .3s ease-in-out;
  border-radius: 8px;
  background-color: #ddd;
}

.ImageInCard img {
  padding: 0 0 0 0 !important;
  height: 100%;
}

.TextInCard {
  line-height: 54px;
  background-color: #f6f6f6;
  font-size: 24px;
}
</style>


