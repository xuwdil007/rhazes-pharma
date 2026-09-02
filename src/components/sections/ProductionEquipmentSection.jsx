import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Boxes,
  Factory,
  Gauge,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { ContentSection, Eyebrow } from "../ui/SiteUi.jsx";

const equipmentGroups = [
  {
    icon: Factory,
    title: "Подготовка и производство",
    text: "Оборудование для подготовки сырья, дозирования, смешивания и получения однородной производственной смеси.",
  },
  {
    icon: Boxes,
    title: "Формирование лекарственных форм",
    text: "Технологические решения для выпуска таблеток, наполнения капсул, а также производства жидких и мягких форм.",
  },
  {
    icon: PackageCheck,
    title: "Упаковка продукции",
    text: "Линии первичной и вторичной упаковки, обеспечивающие защиту продукции и её прослеживаемость.",
  },
];

export function ProductionEquipmentSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <ContentSection className="production-equipment section">
        <div className="production-equipment-heading">
          <Eyebrow>Производственное оснащение</Eyebrow>
          <h2>
            Производственное <em>оборудование</em>
          </h2>
          <p>
            Оборудование объединено в последовательный технологический процесс —
            от подготовки компонентов до контроля и упаковки готовой продукции.
          </p>
          <button
            className="btn production-equipment-button"
            type="button"
            onClick={() => setOpen(true)}
          >
            Об оборудовании <ArrowRight />
          </button>
        </div>
        <div className="production-equipment-grid">
          {equipmentGroups.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <div>
                <Icon />
                <span>0{index + 1}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </ContentSection>

      <div
        className="equipment-modal-backdrop"
        data-cms-block
        data-cms-name="Подробная информация о производственном оборудовании"
        hidden={!open}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <article
          className="equipment-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="equipment-modal-title"
        >
          <button
            className="equipment-modal-close"
            type="button"
            aria-label="Закрыть окно"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
          <header>
            <div className="equipment-modal-icon">
              <Factory />
            </div>
            <div>
              <small>Производственный комплекс</small>
              <h2 id="equipment-modal-title">
                О производственном <em>оборудовании</em>
              </h2>
            </div>
          </header>
          <p className="equipment-modal-lead">
            Производственное оборудование формирует единый управляемый цикл
            выпуска лекарственных препаратов. Его компоновка учитывает
            последовательность операций, разделение потоков сырья и готовой
            продукции, требования к очистке и предотвращению перекрёстной
            контаминации.
          </p>
          <div className="equipment-modal-grid">
            <section>
              <Gauge />
              <div>
                <small>Технологический процесс</small>
                <h3>Подготовка и точное выполнение операций</h3>
                <p>
                  В состав производственного цикла входят подготовка и
                  дозирование компонентов, смешивание, формирование
                  лекарственной формы и передача продукции на следующие стадии.
                  Для твёрдых форм предусмотрены процессы таблетирования,
                  наполнения капсул и нанесения покрытий.
                </p>
              </div>
            </section>
            <section>
              <Boxes />
              <div>
                <small>Лекарственные формы</small>
                <h3>Гибкость производственных линий</h3>
                <p>
                  Технологическое оснащение ориентировано на выпуск таблеток,
                  капсул, жидких препаратов, мазей, кремов и гелей. Для каждой
                  формы применяется собственная последовательность операций и
                  контролируемые параметры процесса.
                </p>
              </div>
            </section>
            <section>
              <ShieldCheck />
              <div>
                <small>Качество и безопасность</small>
                <h3>Контроль критических параметров</h3>
                <p>
                  На этапах производства контролируются заданные параметры,
                  состояние оборудования и соответствие промежуточной продукции
                  установленным требованиям. Конструкция и размещение
                  оборудования должны обеспечивать доступность очистки и
                  технического обслуживания.
                </p>
              </div>
            </section>
            <section>
              <Sparkles />
              <div>
                <small>Очистка оборудования</small>
                <h3>Предотвращение загрязнения</h3>
                <p>
                  После завершения операций проводится очистка в соответствии с
                  установленными процедурами. Разделение производственных зон,
                  управление потоками и подтверждённая готовность оборудования
                  снижают риск переноса остатков продукта между сериями.
                </p>
              </div>
            </section>
            <section className="equipment-modal-wide">
              <PackageCheck />
              <div>
                <small>Завершение цикла</small>
                <h3>Контроль и упаковка готовой продукции</h3>
                <p>
                  После получения лекарственной формы продукция проходит
                  предусмотренный контроль и направляется на первичную и
                  вторичную упаковку. Организация процесса поддерживает
                  идентификацию серии и прослеживаемость движения продукции.
                </p>
              </div>
            </section>
          </div>
        </article>
      </div>
    </>
  );
}
