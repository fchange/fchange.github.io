---
title: 相册
noDate: 'true'
---
<script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery_lazyload/1.9.7/jquery.lazyload.min.js"></script> -->
<script src="https://cdn.jsdelivr.net/npm/minigrid@3.1.1/dist/minigrid.min.js"></script>

<script src="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.0/dist/jquery.fancybox.min.js"></script>
<link href="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.0/dist/jquery.fancybox.min.css" rel="stylesheet">

<div class="ImageGrid"></div>

<script src="/photo/photo.js"></script>

<style>
  .ImageGrid { width: 100%; max-width: 1040px; margin: 0 auto; text-align: center; margin: : 20p;}

  .card { overflow: hidden; transition: .3s ease-in-out; border-radius: 8px; background-color: #ddd;}

  .ImageInCard img {padding: 0 0 0 0 !important;height: 100%;}

  .TextInCard {line-height: 54px;background-color: #f6f6f6;font-size: 24px;}
  
  .fancybox-image { transform: none!important;}
</style>


