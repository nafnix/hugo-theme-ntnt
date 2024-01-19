const { createApp, ref, reactive, onMounted, watch } = Vue;
const app = createApp({
  setup() {
    const currentTheme = ref();

    /**
     * 应用主题
     * @param {string?} theme
     */
    function applyTheme(theme) {
      currentTheme.value = theme;
      if (theme) localStorage.setItem("THEME", theme);
      else localStorage.removeItem("THEME");

      // 如果最后一次使用的主题是暗色或者当前系统主题是暗色
      if (
        theme === "dark" ||
        (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        if ("light" in document.documentElement.classList)
          document.documentElement.remove("light");
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    onMounted(() => {
      applyTheme(localStorage.getItem("THEME"));
    });

    const isOpenThemeDialog = ref(false);
    watch(isOpenThemeDialog, (nv, _) => {
      if (nv) {
        isSearching.value = false;
      }
    });
    document.addEventListener("click", () => {
      if (isOpenThemeDialog.value) {
        isOpenThemeDialog.value = false;
      }
    });

    const isOpenMenu = ref(false);

    const isSearching = ref(false);
    const searchInput = ref(null);
    const searchResult = reactive({ searched: false, results: [] });
    watch(isSearching, (nv, _) => {
      if (!nv) {
        searchInput.value.value = null;
        searchResult.searched = false;
        searchResult.results = [];
      } else {
        isOpenThemeDialog.value = false;
      }
    });
    document.body.addEventListener("click", () => {
      if (isSearching.value) {
        isSearching.value = false;
      }
    });
    let fuse;
    async function search() {
      if (!isSearching.value) {
        isSearching.value = true;
        searchInput.value.focus();
      }

      const searchString = searchInput.value.value;
      if (searchString) {
        if (!fuse) {
          const fetchData = await fetch("/index.json");
          const data = await fetchData.json();
          fuse = new Fuse(data, {
            keys: ["title", "tags", "categories", "contents"],
          });
        }

        const result = fuse.search(searchString);
        searchResult.searched = true;
        searchResult.results = result;
      }
    }

    return {
      currentTheme,
      applyTheme,
      isOpenThemeDialog,
      isOpenMenu,
      isSearching,
      searchInput,
      searchResult,
      search,
    };
  },
});
app.config.compilerOptions.delimiters = ["[[", "]]"];
app.mount("#app");

document.addEventListener("DOMContentLoaded", () => {
  // 给带有 id 的 h1 - h6 添加索引
  document.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach((hNumEle) => {
    const hNumEleID = hNumEle.id;
    if (hNumEleID) {
      const linkEle = document.createElement("a");
      linkEle.href = `${location.pathname}#${hNumEleID}`;
      linkEle.textContent = hNumEle.textContent;
      // linkEle.setAttribute("target", "_blank");
      // linkEle.setAttribute("rel", "noopener noreferrer");
      hNumEle.textContent = "";
      hNumEle.appendChild(linkEle);
      // linkEle.appendChild(hNumEle.cloneNode(true));
      // hNumEle.replaceWith(linkEle);
    }
  });

  // 给代码块添加复制按钮
  document.querySelectorAll(".highlight").forEach((codeblockEle) => {
    const codes = codeblockEle.querySelectorAll("pre > code");
    const codeEle = codes[codes.length - 1];

    let content = "";
    codeEle.childNodes.forEach((spanEle) => {
      content += spanEle.innerText;
    });

    // 复制按钮
    {
      const copyBtn = document.createElement("button");
      copyBtn.classList.add("copy-btn");

      copyBtn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M7 9.667A2.667 2.667 0 0 1 9.667 7h8.666A2.667 2.667 0 0 1 21 9.667v8.666A2.667 2.667 0 0 1 18.333 21H9.667A2.667 2.667 0 0 1 7 18.333z"/><path d="M4.012 16.737A2.005 2.005 0 0 1 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1"/></g></svg>';
      const copyBtnText = document.createElement("span");
      copyBtnText.innerText = "复制";
      copyBtn.appendChild(copyBtnText);

      copyBtn.onclick = () => {
        copyBtnText.innerText = "复制成功";

        setTimeout(() => {
          copyBtnText.innerText = "复制";
        }, 500);

        navigator.clipboard.writeText(content);
      };
      codeblockEle.appendChild(copyBtn);
    }
  });

  // 给 img 外添加一个添加 a 标签
  document.querySelectorAll("img").forEach((imgEle) => {
    const parentEle = imgEle.parentElement;
    if (parentEle.tagName !== "a") {
      parentEle.removeChild(imgEle);

      const linkEle = document.createElement("a");
      linkEle.classList.add("image");
      linkEle.setAttribute("target", "_blank");
      linkEle.setAttribute("rel", "noopener noreferrer");
      linkEle.href = imgEle.src;
      linkEle.appendChild(imgEle);

      parentEle.appendChild(linkEle);
    }
  });

  // // 给行内代码添加点击时复制
  // document.querySelectorAll(":not(pre) > code").forEach((codeEle) => {
  //   codeEle.style.cursor = "pointer";
  //   codeEle.onclick = (e) => {
  //     navigator.clipboard.writeText(codeEle.textContent);
  //     console.log(e);
  //     const copyMsg = document.createElement("span");
  //     copyMsg.textContent = "复制成功";
  //     copyMsg.style.position = "absolute";
  //     copyMsg.style.color = "gray";
  //     copyMsg.style.top = `${e.clientY}px`;
  //     copyMsg.style.left = `${e.clientX}px`;
  //     document.body.appendChild(copyMsg);
  //     setTimeout(() => {
  //       copyMsg.remove();
  //     }, 500);
  //   };
  // });
});
