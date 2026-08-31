import React, { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Pencil,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { navigation as nav } from "../data/siteContent.js";
import { Logo } from "../components/layout/SiteLayout.jsx";
import staticContent from "../../backend/data/content.json";
import {
  About,
  Career,
  Contacts,
  Home,
  Products,
  Production,
  Quality,
} from "../pages/SitePages.jsx";

const isStaticSite = import.meta.env.VITE_STATIC_SITE === "true";
const staticAdminLogin = "admin";
const staticAdminPassword = "Rhazes2026!";

function storeLocalContent(content) {
  localStorage.setItem("rhazes-cms-content", JSON.stringify(content));
  window.dispatchEvent(
    new CustomEvent("rhazes-content-updated", { detail: content }),
  );
}

function getCmsKey(node, root, region) {
  const parts = [];
  let element = node.parentElement;
  while (element && element !== root) {
    const parent = element.parentElement;
    const index = parent ? [...parent.children].indexOf(element) : 0;
    parts.unshift(`${element.tagName.toLowerCase()}${index}`);
    element = parent;
  }
  const textIndex = [...node.parentNode.childNodes]
    .filter((item) => item.nodeType === Node.TEXT_NODE && item.nodeValue.trim())
    .indexOf(node);
  return `${region}:${parts.join("/")}:t${textIndex}`;
}

function getCmsAttributeKey(element, root, region, attribute) {
  const parts = [];
  let current = element;
  while (current && current !== root) {
    const parent = current.parentElement;
    const index = parent ? [...parent.children].indexOf(current) : 0;
    parts.unshift(`${current.tagName.toLowerCase()}${index}`);
    current = parent;
  }
  return `${region}:${parts.join("/")}:a-${attribute}`;
}

function getEditableTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (
        !parent ||
        parent.closest("[data-no-cms]") ||
        parent.closest("svg, script, style, textarea")
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}

function getEditableAttributes(scope, root, region) {
  return [
    ...[...scope.querySelectorAll("[placeholder]")].map((element) => ({
      key: getCmsAttributeKey(element, root, region, "placeholder"),
      element,
      attribute: "placeholder",
      type: "text",
      label: "Подсказка поля",
      original: element.getAttribute("placeholder") || "",
    })),
    ...[...scope.querySelectorAll("img[data-cms-image]")].map((element) => ({
      key: getCmsAttributeKey(element, root, region, "src"),
      element,
      attribute: "src",
      type: "image",
      label: element.dataset.cmsImage || "Изображение",
      original: element.getAttribute("src") || "",
    })),
  ];
}

function applyStoredContent(root, region, content) {
  const prefix = `${region}:`;
  Object.entries(content).forEach(([key, value]) => {
    if (!key.startsWith(prefix)) return;
    const relative = key.slice(prefix.length);
    const separator = relative.lastIndexOf(":");
    if (separator < 0) return;
    const path = relative.slice(0, separator);
    const target = relative.slice(separator + 1);
    let element = root;
    for (const segment of path.split("/").filter(Boolean)) {
      element = [...element.children].find(
        (child, index) => `${child.tagName.toLowerCase()}${index}` === segment,
      );
      if (!element) return;
    }
    if (target.startsWith("t")) {
      const index = Number(target.slice(1));
      const textNodes = [...element.childNodes].filter(
        (node) => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim(),
      );
      if (textNodes[index] && textNodes[index].nodeValue !== value) {
        const currentValue = textNodes[index].nodeValue;
        const leadingSpace = currentValue.match(/^\s*/)?.[0] || "";
        const trailingSpace = currentValue.match(/\s*$/)?.[0] || "";
        textNodes[index].nodeValue = `${leadingSpace}${value}${trailingSpace}`;
      }
      return;
    }
    if (target.startsWith("a-")) {
      const attribute = target.slice(2);
      if (element.getAttribute(attribute) !== value) {
        element.setAttribute(attribute, value);
      }
    }
  });
}

export function CmsRuntime({ route }) {
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const editMode = sessionStorage.getItem("rhazes-cms-edit") === "1";
  const [contentVersion, setContentVersion] = useState(0);

  useEffect(() => {
    const refreshContent = () => setContentVersion((version) => version + 1);
    window.addEventListener("storage", refreshContent);
    window.addEventListener("rhazes-content-updated", refreshContent);
    return () => {
      window.removeEventListener("storage", refreshContent);
      window.removeEventListener("rhazes-content-updated", refreshContent);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let contentObserver;
    let contentFrame = 0;
    const local = {
      ...staticContent,
      ...JSON.parse(localStorage.getItem("rhazes-cms-content") || "{}"),
    };

    async function load() {
      let content = local;
      if (import.meta.env.VITE_STATIC_SITE !== "true") {
        try {
          const response = await fetch(`/api/content?t=${Date.now()}`, {
            cache: "no-store",
          });
          if (response.ok) content = await response.json();
        } catch {}
      }
      if (cancelled) return;
      localStorage.setItem("rhazes-cms-content", JSON.stringify(content));

      requestAnimationFrame(() => {
        const regions = [
          [document.querySelector("header"), "global-header"],
          [document.querySelector("main"), `page-${route || "home"}`],
          [document.querySelector("footer"), "global-footer"],
        ];

        regions.forEach(([root, region]) => {
          if (!root) return;
          applyStoredContent(root, region, content);
          getEditableTextNodes(root).forEach((node) => {
            const key = getCmsKey(node, root, region);
            const original = node.nodeValue;
            const parent = node.parentElement;
            if (!editMode || parent?.classList.contains("cms-editable")) return;
            parent.classList.add("cms-editable");
            parent.dataset.cmsKey = key;
            parent.dataset.cmsOriginal = original;
            parent.__cmsTextNode = node;
          });
        });

        const renderCustomLinks = (key, target, before = null) => {
          if (!target) return;
          target
            .querySelectorAll(":scope > .cms-custom-link")
            .forEach((link) => link.remove());
          String(content[key] || "")
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .forEach((line) => {
              const [rawLabel, ...rawHref] = line.split("|");
              const label = rawLabel.trim();
              const href = rawHref.join("|").trim() || "#/";
              if (!label) return;
              const link = document.createElement("a");
              link.className = "cms-custom-link";
              link.textContent = label;
              link.href = href;
              target.insertBefore(link, before);
            });
        };

        const headerNav = document.querySelector("header nav");
        renderCustomLinks(
          "custom-links:global-header",
          headerNav,
          headerNav?.querySelector(".mobile-cta") || null,
        );
        renderCustomLinks(
          "custom-links:global-footer",
          document.querySelector("footer .footer-main > div:nth-child(2)"),
        );

        const main = document.querySelector("main");
        const pageRegion = `page-${route || "home"}`;
        main?.querySelectorAll(":scope > section").forEach((section, index) => {
          const hiddenKey = `hidden:${pageRegion}:section-${index}`;
          const addKey = `custom:${pageRegion}:section-${index}`;
          section.style.display = content[hiddenKey] === "1" ? "none" : "";
          section.querySelector(":scope > .cms-added-content")?.remove();
          if (content[addKey]) {
            const additional = document.createElement("div");
            additional.className = "cms-added-content";
            additional.textContent = content[addKey];
            section.appendChild(additional);
          }
        });
        main
          ?.querySelectorAll(":scope > [data-cms-block]")
          .forEach((block, index) => {
            const hiddenKey = `hidden:${pageRegion}:cms-block-${index}`;
            if (content[hiddenKey] === "1") {
              block.dataset.cmsForceHidden = "true";
            } else {
              delete block.dataset.cmsForceHidden;
            }
          });

        const customBlockListKey = `custom-blocks:${pageRegion}`;
        let customBlockIds = [];
        try {
          customBlockIds = JSON.parse(content[customBlockListKey] || "[]");
        } catch {
          customBlockIds = [];
        }
        main
          ?.querySelectorAll(":scope > .cms-custom-section")
          .forEach((section) => section.remove());
        customBlockIds.forEach((id) => {
          const titleKey = `custom-block:${pageRegion}:${id}:title`;
          const textKey = `custom-block:${pageRegion}:${id}:text`;
          const section = document.createElement("section");
          section.className = "section cms-custom-section";
          const title = document.createElement("h2");
          const paragraph = document.createElement("p");
          title.textContent = content[titleKey] || "Новый текстовый блок";
          paragraph.textContent =
            content[textKey] || "Добавьте текст в админке.";
          section.append(title, paragraph);
          main?.appendChild(section);
        });

        const reapplyTextContent = () => {
          const currentRegions = [
            [document.querySelector("header"), "global-header"],
            [document.querySelector("main"), pageRegion],
            [document.querySelector("footer"), "global-footer"],
          ];
          currentRegions.forEach(([root, region]) => {
            if (!root) return;
            applyStoredContent(root, region, content);
          });
        };

        contentObserver = new MutationObserver(() => {
          cancelAnimationFrame(contentFrame);
          contentFrame = requestAnimationFrame(reapplyTextContent);
        });
        const appRoot = document.getElementById("root");
        if (appRoot) {
          contentObserver.observe(appRoot, { childList: true, subtree: true });
        }
        reapplyTextContent();
      });
    }
    load();
    return () => {
      cancelled = true;
      contentObserver?.disconnect();
      cancelAnimationFrame(contentFrame);
    };
  }, [route, editMode, contentVersion]);

  useEffect(() => {
    if (!editMode) return undefined;
    const handleClick = (event) => {
      const target = event.target.closest?.(".cms-editable");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      setEditor(target);
      setDraft(target.__cmsTextNode?.nodeValue || target.textContent);
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [editMode]);

  async function saveText() {
    if (!editor) return;
    const content = JSON.parse(
      localStorage.getItem("rhazes-cms-content") || "{}",
    );
    content[editor.dataset.cmsKey] = draft;
    storeLocalContent(content);
    if (editor.__cmsTextNode) editor.__cmsTextNode.nodeValue = draft;
    if (isStaticSite) {
      setNotice("Изменение сохранено в этом браузере");
      setEditor(null);
      setTimeout(() => setNotice(""), 3500);
      return;
    }
    const token = sessionStorage.getItem("rhazes-admin-token");
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(content),
      });
      if (!response.ok) throw new Error("save failed");
      setNotice("Изменение сохранено на сервере");
    } catch {
      setNotice(
        "Сохранено локально. Для общего доступа запустите сайт через npm start.",
      );
    }
    setEditor(null);
    setTimeout(() => setNotice(""), 3500);
  }

  if (!editMode) return null;

  return (
    <div data-no-cms>
      <div className="cms-toolbar">
        <div>
          <Pencil size={17} />
          <b>Режим редактирования</b>
          <span>Нажмите на любой текст</span>
        </div>
        <div>
          <button onClick={() => (location.hash = "/admin")}>
            <LayoutDashboard size={16} /> Админка
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("rhazes-cms-edit");
              location.reload();
            }}
          >
            <LogOut size={16} /> Завершить
          </button>
        </div>
      </div>
      {notice && <div className="cms-notice">{notice}</div>}
      {editor && (
        <div className="cms-modal-backdrop" onMouseDown={() => setEditor(null)}>
          <div
            className="cms-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <small>Редактирование текста</small>
            <textarea
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div>
              <button className="cms-cancel" onClick={() => setEditor(null)}>
                Отмена
              </button>
              <button className="cms-save" onClick={saveText}>
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildCmsCatalog() {
  const pageViews = [
    ["home", "Главная", "/", <Home />],
    ["about", "О компании", "/about", <About />],
    ["production", "Производство", "/production", <Production />],
    ["quality", "Качество", "/quality", <Quality />],
    ["products", "Продукция", "/products", <Products />],
    ["career", "Карьера", "/career", <Career />],
    ["contacts", "Контакты", "/contacts", <Contacts />],
  ];
  const groups = [];

  pageViews.forEach(([id, name, route, view], pageIndex) => {
    const html = renderToStaticMarkup(view);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    const region = `page-${route || "home"}`;
    const blocks = main
      ? [
          ...main.querySelectorAll(
            ":scope > section, :scope > [data-cms-block]",
          ),
        ].map((section, blockIndex) => {
          const isSection = section.matches("section");
          const sectionIndex = isSection
            ? [...main.querySelectorAll(":scope > section")].indexOf(section)
            : -1;
          const cmsBlockIndex = !isSection
            ? [...main.querySelectorAll(":scope > [data-cms-block]")].indexOf(
                section,
              )
            : -1;
          const heading = section.querySelector("h1, h2, h3, .eyebrow");
          const blockName =
            section.dataset.cmsName ||
            heading?.textContent.trim().replace(/\s+/g, " ") ||
            `Блок ${blockIndex + 1}`;
          const logicalEntries = new Map();
          getEditableTextNodes(section).forEach((node) => {
            const owner = node.parentElement.closest(
              "h1, h2, h3, p, a, button, .eyebrow, strong, small, b, span",
            );
            const entryOwner = owner || node.parentElement;
            if (!logicalEntries.has(entryOwner)) {
              logicalEntries.set(entryOwner, []);
            }
            logicalEntries.get(entryOwner).push(node);
          });
          const entries = [...logicalEntries.values()].map((nodes) => {
            const parts = nodes.map((node) => ({
              key: getCmsKey(node, main, region),
              original: node.nodeValue,
            }));
            const original = parts
              .map((part) => part.original.trim())
              .filter(Boolean)
              .join(" ");
            return {
              key: parts[0].key,
              parts,
              original,
              preview: original.slice(0, 90),
            };
          });
          getEditableAttributes(section, main, region).forEach((attribute) => {
            entries.push({
              key: attribute.key,
              parts: [
                {
                  key: attribute.key,
                  original: attribute.original,
                },
              ],
              original: attribute.original,
              type: attribute.type,
              label: attribute.label,
              preview:
                attribute.type === "image"
                  ? attribute.label
                  : `Подсказка поля: ${attribute.original}`.slice(0, 90),
            });
          });
          return {
            id: `${id}-block-${blockIndex}`,
            name: blockName.slice(0, 70),
            index: blockIndex,
            region,
            entries,
            addKey: isSection
              ? `custom:${region}:section-${sectionIndex}`
              : null,
            hiddenKey: isSection
              ? `hidden:${region}:section-${sectionIndex}`
              : `hidden:${region}:cms-block-${cmsBlockIndex}`,
          };
        })
      : [];
    groups.push({ id, name, route, blocks });

    if (pageIndex === 0) {
      [
        ["global-header", "Шапка сайта", doc.querySelector("header")],
        ["global-footer", "Подвал сайта", doc.querySelector("footer")],
      ].forEach(([region, regionName, root]) => {
        const globalEntries = root
          ? getEditableTextNodes(root).map((node, index) => ({
              key: getCmsKey(node, root, region),
              parts: [
                {
                  key: getCmsKey(node, root, region),
                  original: node.nodeValue,
                },
              ],
              label: `Текст ${index + 1}`,
              original: node.nodeValue,
              preview: node.nodeValue.trim().slice(0, 90),
            }))
          : [];
        groups.unshift({
          id: region,
          name: regionName,
          route: null,
          blocks: [
            {
              id: `${region}-block`,
              name: regionName,
              index: 0,
              region,
              entries: globalEntries,
              addKey: `custom-links:${region}`,
              hiddenKey: null,
            },
          ],
        });
      });
    }
  });
  const groupOrder = [
    "home",
    "about",
    "production",
    "quality",
    "products",
    "contacts",
    "global-header",
    "global-footer",
  ];
  groups.sort(
    (first, second) =>
      groupOrder.indexOf(first.id) - groupOrder.indexOf(second.id),
  );
  return groups;
}

function getEntryValue(entry, content) {
  return entry.parts
    .map((part) => content[part.key] ?? part.original)
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" ");
}

function distributeEntryValue(entry, value) {
  if (entry.parts.length === 1) return { [entry.parts[0].key]: value };

  const words = value.trim().split(/\s+/).filter(Boolean);
  const result = {};
  let offset = 0;

  entry.parts.forEach((part, index) => {
    const originalWordCount = part.original
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const isLast = index === entry.parts.length - 1;
    const amount = isLast ? words.length - offset : originalWordCount;
    result[part.key] = words.slice(offset, offset + amount).join(" ");
    offset += amount;
  });

  return result;
}

export function Admin() {
  const [token, setToken] = useState(
    sessionStorage.getItem("rhazes-admin-token"),
  );
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [content, setContent] = useState(() =>
    JSON.parse(localStorage.getItem("rhazes-cms-content") || "{}"),
  );
  const baseCatalog = useMemo(buildCmsCatalog, []);
  const [activeGroup, setActiveGroup] = useState("home");
  const [activeBlock, setActiveBlock] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [savedKey, setSavedKey] = useState("");
  const [search, setSearch] = useState("");

  const catalog = useMemo(
    () =>
      baseCatalog.map((group) => {
        if (group.id.startsWith("global-")) return group;
        const region = `page-${group.route || "home"}`;
        const listKey = `custom-blocks:${region}`;
        let ids = [];
        try {
          ids = JSON.parse(content[listKey] || "[]");
        } catch {
          ids = [];
        }
        const customBlocks = ids.map((id) => {
          const titleKey = `custom-block:${region}:${id}:title`;
          const textKey = `custom-block:${region}:${id}:text`;
          const title = content[titleKey] || "Новый текстовый блок";
          const text = content[textKey] || "Добавьте текст в админке.";
          return {
            id: `custom-${region}-${id}`,
            name: title,
            custom: true,
            customId: id,
            customListKey: listKey,
            entries: [
              {
                key: titleKey,
                parts: [{ key: titleKey, original: title }],
                original: title,
                preview: title,
              },
              {
                key: textKey,
                parts: [{ key: textKey, original: text }],
                original: text,
                preview: text.slice(0, 90),
              },
            ],
            addKey: null,
            hiddenKey: null,
          };
        });
        return { ...group, blocks: [...group.blocks, ...customBlocks] };
      }),
    [baseCatalog, content],
  );

  useEffect(() => {
    sessionStorage.removeItem("rhazes-cms-edit");
  }, []);

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    try {
      if (isStaticSite) {
        if (login !== staticAdminLogin || password !== staticAdminPassword) {
          throw new Error("Неверный логин или пароль");
        }
        const staticToken = "static-admin-session";
        sessionStorage.setItem("rhazes-admin-token", staticToken);
        setToken(staticToken);
        setContent(
          JSON.parse(localStorage.getItem("rhazes-cms-content") || "{}"),
        );
        return;
      }
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ошибка входа");
      sessionStorage.setItem("rhazes-admin-token", data.token);
      setToken(data.token);
      const current = await fetch(`/api/content?t=${Date.now()}`, {
        cache: "no-store",
      }).then((result) => result.json());
      localStorage.setItem("rhazes-cms-content", JSON.stringify(current));
      setContent(current);
    } catch (loginError) {
      setError(loginError.message || "Сервер админки недоступен");
    }
  }

  async function resetContent() {
    if (!confirm("Удалить все изменения и вернуть исходные тексты сайта?"))
      return;
    if (isStaticSite) {
      storeLocalContent({});
      setContent({});
      setDrafts({});
      return;
    }
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: "{}",
    });
    if (!response.ok) return setError("Не удалось сбросить изменения");
    localStorage.setItem("rhazes-cms-content", "{}");
    setContent({});
    setDrafts({});
  }

  async function persist(nextContent) {
    if (isStaticSite) {
      storeLocalContent(nextContent);
      setContent(nextContent);
      return;
    }
    const response = await fetch("/api/content", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nextContent),
    });
    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.removeItem("rhazes-admin-token");
        setToken(null);
      }
      throw new Error("Не удалось сохранить изменение");
    }
    localStorage.setItem("rhazes-cms-content", JSON.stringify(nextContent));
    setContent(nextContent);
    window.dispatchEvent(
      new CustomEvent("rhazes-content-updated", { detail: nextContent }),
    );
  }

  async function saveField(entry) {
    setError("");
    try {
      const value = drafts[entry.key] ?? getEntryValue(entry, content);
      await persist({
        ...content,
        ...distributeEntryValue(entry, value),
      });
      setSavedKey(entry.key);
      setTimeout(() => setSavedKey(""), 1800);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function clearField(entry) {
    setDrafts((current) => ({ ...current, [entry.key]: "" }));
    try {
      await persist({
        ...content,
        ...distributeEntryValue(entry, ""),
      });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function restoreField(entry) {
    const next = { ...content };
    delete next[entry.key];
    setDrafts((current) => {
      const updated = { ...current };
      delete updated[entry.key];
      return updated;
    });
    try {
      await persist(next);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function selectImageFile(entry, file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Выберите файл изображения");
      return;
    }
    setError("");
    const source = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Не удалось прчитать файл"));
      reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve, reject) => {
      const preview = new Image();
      preview.onload = () => resolve(preview);
      preview.onerror = () =>
        reject(new Error("Не удалось открыть изображение"));
      preview.src = source;
    });
    const maxSide = 1920;
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const optimized = canvas.toDataURL("image/jpeg", 0.84);
    setDrafts((current) => ({ ...current, [entry.key]: optimized }));
  }

  async function saveBlock(block) {
    setError("");
    const next = { ...content };
    block.entries.forEach((entry) => {
      if (Object.hasOwn(drafts, entry.key)) {
        Object.assign(next, distributeEntryValue(entry, drafts[entry.key]));
      }
    });
    if (block.addKey && Object.hasOwn(drafts, block.addKey)) {
      next[block.addKey] = drafts[block.addKey];
    }
    try {
      await persist(next);
      setSavedKey(block.id);
      setTimeout(() => setSavedKey(""), 1800);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function hideBlock(block, confirmed = false) {
    if (
      !block.hiddenKey ||
      (!confirmed && !confirm("Скрыть весь блок на сайте?"))
    )
      return;
    try {
      await persist({ ...content, [block.hiddenKey]: "1" });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function showBlock(block) {
    if (!block.hiddenKey) return;
    const next = { ...content };
    delete next[block.hiddenKey];
    try {
      await persist(next);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function addCustomBlock() {
    if (activeGroup.startsWith("global-")) return;
    const region = `page-${group.route || "home"}`;
    const listKey = `custom-blocks:${region}`;
    let ids = [];
    try {
      ids = JSON.parse(content[listKey] || "[]");
    } catch {
      ids = [];
    }
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const titleKey = `custom-block:${region}:${id}:title`;
    const textKey = `custom-block:${region}:${id}:text`;
    const next = {
      ...content,
      [listKey]: JSON.stringify([...ids, id]),
      [titleKey]: "Новый текстовый блок",
      [textKey]: "Добавьте текст в админке.",
    };
    try {
      await persist(next);
      setActiveBlock(`custom-${region}-${id}`);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function deleteBlock(block) {
    if (!confirm("Удалить этот блок с сайта?")) return;
    if (!block.custom) {
      await hideBlock(block, true);
      return;
    }
    let ids = [];
    try {
      ids = JSON.parse(content[block.customListKey] || "[]");
    } catch {
      ids = [];
    }
    const next = { ...content };
    next[block.customListKey] = JSON.stringify(
      ids.filter((id) => id !== block.customId),
    );
    block.entries.forEach((entry) => delete next[entry.key]);
    try {
      await persist(next);
      if (activeBlock === block.id) setActiveBlock(null);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  async function deleteCustomLink(block, linkIndex) {
    if (!block.addKey || !confirm("Удалить этот пункт меню?")) return;
    const currentValue = drafts[block.addKey] ?? content[block.addKey] ?? "";
    const nextValue = currentValue
      .split("\n")
      .filter((line) => line.trim())
      .filter((_, index) => index !== linkIndex)
      .join("\n");
    setDrafts((current) => ({ ...current, [block.addKey]: nextValue }));
    try {
      await persist({ ...content, [block.addKey]: nextValue });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  function getCustomLinks(block) {
    return String(drafts[block.addKey] ?? content[block.addKey] ?? "")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const [name, ...href] = line.split("|");
        return {
          name: name.trim(),
          href: href.join("|").trim() || "#/",
        };
      });
  }

  function setCustomLinks(block, links) {
    const value = links
      .map((link) => `${link.name.trim()} | ${link.href.trim() || "#/"}`)
      .join("\n");
    setDrafts((current) => ({ ...current, [block.addKey]: value }));
  }

  function addCustomLink(block) {
    setCustomLinks(block, [
      ...getCustomLinks(block),
      { name: "Новый раздел", href: "#/" },
    ]);
  }

  function updateCustomLink(block, linkIndex, field, value) {
    const links = getCustomLinks(block);
    links[linkIndex] = { ...links[linkIndex], [field]: value };
    setCustomLinks(block, links);
  }

  function exportContent() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rhazes-content-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (!token) {
    return (
      <main className="admin-login" data-no-cms>
        <form onSubmit={submitLogin}>
          <Logo />
          <span>Панель управления</span>
          <h1>Вход в админку</h1>
          <label>
            Логин
            <input
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label>
            Пароль
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
          {error && <p className="admin-error">{error}</p>}
          <button className="btn">
            Войти <ArrowRight size={17} />
          </button>
          <a href="#/">Вернуться на сайт</a>
        </form>
      </main>
    );
  }

  const group = catalog.find((item) => item.id === activeGroup) || catalog[0];
  const blocks = group.blocks.filter((block) =>
    `${block.name} ${block.entries.map((entry) => entry.preview).join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const block = group.blocks.find((item) => item.id === activeBlock);

  return (
    <main className="admin-shell" data-no-cms>
      <aside>
        <Logo />
        <small>Разделы сайта</small>
        <nav className="admin-section-nav">
          {catalog.map((item) => (
            <button
              className={activeGroup === item.id ? "active" : ""}
              onClick={() => {
                setActiveGroup(item.id);
                setActiveBlock(null);
                setSearch("");
              }}
              key={item.id}
            >
              <span>{item.name}</span>
              <b>{item.blocks.length}</b>
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            sessionStorage.clear();
            setToken(null);
          }}
        >
          <LogOut /> Выйти
        </button>
      </aside>
      <section className="admin-content">
        <header>
          <div>
            <span>Управление сайтом</span>
            <h1>{group.name}</h1>
          </div>
          <a href={`${import.meta.env.BASE_URL}#/`}>
            Открыть сайт <ArrowUpRight />
          </a>
        </header>
        <div className="admin-stats">
          <article>
            <strong>{catalog.length}</strong>
            <span>разделов управления</span>
          </article>
          <article>
            <strong>{Object.keys(content).length}</strong>
            <span>изменённых фрагментов</span>
          </article>
          <article>
            <strong>{group.blocks.length}</strong>
            <span>блоков на странице</span>
          </article>
        </div>
        <div className="admin-panel-head">
          <div>
            <h2>{block ? "Редактирование блока" : "Блоки страницы"}</h2>
            <p>
              {block
                ? "Все поля выбранного блока редактируются в одной форме."
                : "Выберите целый блок страницы для управления его содержимым."}
            </p>
          </div>
          <div>
            {!block && !activeGroup.startsWith("global-") && (
              <button className="admin-create-block" onClick={addCustomBlock}>
                Добавить текстовый блок
              </button>
            )}
            <button onClick={exportContent}>
              <Download /> Экспорт
            </button>
            <button className="danger" onClick={resetContent}>
              <RotateCcw /> Сбросить
            </button>
          </div>
        </div>
        <div className="admin-search">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск текста в разделе…"
          />
          <span>{blocks.length} блоков</span>
        </div>
        {error && <p className="admin-error">{error}</p>}
        {!block ? (
          <div className="admin-blocks">
            {blocks.map((item, index) => {
              const hidden = item.hiddenKey && content[item.hiddenKey] === "1";
              return (
                <article
                  className={`admin-block-card ${hidden ? "is-hidden" : ""}`}
                  key={item.id}
                >
                  <button
                    className="admin-block-open"
                    onClick={() => setActiveBlock(item.id)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.entries.length} полей {hidden && "· блок удалён"}
                      </p>
                    </div>
                    <Pencil />
                  </button>
                  {hidden ? (
                    <button
                      className="admin-block-restore"
                      title="Вернуть блок"
                      onClick={() => showBlock(item)}
                    >
                      <RotateCcw />
                    </button>
                  ) : (
                    (item.custom || item.hiddenKey) && (
                      <button
                        className="admin-block-delete"
                        title="Удалить блок"
                        onClick={() => deleteBlock(item)}
                      >
                        <Trash2 />
                      </button>
                    )
                  )}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-block-editor">
            <div className="admin-block-title">
              <button onClick={() => setActiveBlock(null)}>
                <ArrowLeft /> Назад к блокам
              </button>
              <div>
                <small>Выбранный блок</small>
                <h2>{block.name}</h2>
              </div>
            </div>
            <div className="admin-block-fields">
              {block.entries.map((entry, index) => {
                const value =
                  drafts[entry.key] ?? getEntryValue(entry, content);
                return (
                  <label key={entry.key}>
                    <span>{entry.label || `Поле ${index + 1}`}</span>
                    {entry.type === "image" ? (
                      <div className="admin-image-field">
                        <img src={value} alt="Предпросмотр" />
                        <div>
                          <label className="admin-image-upload">
                            <ImageIcon /> Выбрать фото
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                selectImageFile(entry, event.target.files?.[0])
                              }
                            />
                          </label>
                          <input
                            className="admin-image-url"
                            value={value}
                            placeholder="Или вставьте URL изображения"
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [entry.key]: event.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <textarea
                        value={value}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [entry.key]: event.target.value,
                          }))
                        }
                      />
                    )}
                    <div className="admin-field-buttons">
                      <button
                        className="admin-save-field"
                        type="button"
                        onClick={() => saveField(entry)}
                      >
                        <Save />
                        {savedKey === entry.key ? "Сохранено" : "Сохранить"}
                      </button>
                      <button
                        className="admin-delete-field"
                        type="button"
                        onClick={() => {
                          if (confirm("Удалить текст из этого поля?")) {
                            clearField(entry);
                          }
                        }}
                      >
                        <Trash2 /> Удалить текст
                      </button>
                    </div>
                  </label>
                );
              })}
              {block.addKey && (
                <div className="admin-additional">
                  <span>
                    {block.addKey.startsWith("custom-links:")
                      ? "Дополнительные пункты меню"
                      : "Дополнительный текст"}
                  </span>
                  {block.addKey.startsWith("custom-links:") ? (
                    <div className="admin-custom-links">
                      {getCustomLinks(block).map((link, index) => (
                        <div key={index}>
                          <label>
                            <span>Название</span>
                            <input
                              value={link.name}
                              onChange={(event) =>
                                updateCustomLink(
                                  block,
                                  index,
                                  "name",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <label>
                            <span>Ссылка</span>
                            <input
                              value={link.href}
                              onChange={(event) =>
                                updateCustomLink(
                                  block,
                                  index,
                                  "href",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => deleteCustomLink(block, index)}
                            aria-label={`Удалить ${link.name}`}
                          >
                            <Trash2 /> Удалить
                          </button>
                        </div>
                      ))}
                      <button
                        className="admin-add-link"
                        type="button"
                        onClick={() => addCustomLink(block)}
                      >
                        Добавить раздел
                      </button>
                    </div>
                  ) : (
                    <textarea
                      placeholder="Добавьте новую информацию в конец блока…"
                      value={
                        drafts[block.addKey] ?? content[block.addKey] ?? ""
                      }
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [block.addKey]: event.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              )}
            </div>
            <div className="admin-block-actions">
              <button className="save" onClick={() => saveBlock(block)}>
                <Save />{" "}
                {savedKey === block.id ? "Сохранено" : "Сохранить весь блок"}
              </button>
              {block.hiddenKey && content[block.hiddenKey] === "1" ? (
                <button onClick={() => showBlock(block)}>
                  <RotateCcw /> Показать блок
                </button>
              ) : (
                block.hiddenKey && (
                  <button className="danger" onClick={() => hideBlock(block)}>
                    <Trash2 /> Скрыть блок
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
