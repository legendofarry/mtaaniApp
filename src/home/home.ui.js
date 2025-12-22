export const renderHome = async () => {
  const content = document.getElementById("content");

  content.innerHTML = `
    <section
  class="flex flex-col items-center justify-between h-full px-4 py-6 text-center"
>
  <!-- Lottie -->
  <lottie-player
    src="https://assets10.lottiefiles.com/packages/lf20_qp1q7mct.json"
    background="transparent"
    speed="1"
    loop
    autoplay
    class="w-64 max-w-full mt-6"
  ></lottie-player>

  <!-- Text -->
  <div class="mt-6">
    <h2 class="text-2xl font-bold text-gray-900">
      Welcome to Flux
    </h2>
    <p class="mt-2 text-sm text-gray-500 leading-relaxed">
      Manage water & electricity in your community
    </p>
  </div>
</section>
  `;
};
