/* ============================================
   HK POS eSignature - Review Page
   - Form review page initialization (PDF templates)
   ============================================ */

(function () {
  'use strict';

  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const Utils = window.HKPOS.Utils;
  const FormHandler = window.HKPOS.FormHandler;

  const { qs, qsa, load, save, setText, getSelectedForms, navFlow, toast } = Utils;
  const { collectFormDataFromInput, loadFormHTML } = FormHandler;

  function t(key, params) {
    if (!window.HKPOS || !window.HKPOS.i18n || !window.HKPOS.i18n.t) return key;
    var s = window.HKPOS.i18n.t(key, params);
    return s != null ? s : key;
  }

  function initReviewPage() {
    const forms = getSelectedForms();

    const countBadge = qs("#tab-count-badge");
    if (countBadge) countBadge.textContent = t("app.review.formsCount", { count: forms.length });
    const selectedList = qs("#selected-forms-list");
    if (selectedList) {
      selectedList.innerHTML = forms.length
        ? `<ul style="margin-left: 18px; color: var(--text-secondary); line-height: 1.7;">
            ${forms
              .map((f) => `<li>${f.title} ${f.requiresSignature ? '<span class="app-badge" style="margin-left:6px;">서명</span>' : ""}</li>`)
              .join("")}
          </ul>`
        : "-";
    }

    const tabMenu = qs("#tab-menu");
    const tabHost = qs("#tab-host");
    if (!tabMenu || !tabHost) return;

    if (forms.length === 0) {
      tabMenu.innerHTML = "";
      tabHost.innerHTML = `<div class="result-placeholder"><p>확인할 항목이 없습니다.</p></div>`;
      return;
    }

    // stepper 높이 계산 및 form-selection-header top 설정
    const stepper = qs(".t-stepper");
    const formHeader = qs(".form-selection-header");
    if (stepper && formHeader) {
      const stepperHeight = stepper.offsetHeight;
      formHeader.style.top = `${stepperHeight}px`;
    }

    // 상단: 양식 썸네일 목록 (썸네일에는 titleShort, 툴팁에는 전체 제목)
    tabMenu.innerHTML = forms
      .map(
        (f, idx) => {
          var shortKey = "form." + f.key + ".titleShort";
          var fullKey = "form." + f.key + ".title";
          var shortT = t(shortKey);
          var fullT = t(fullKey);
          var label = (shortT !== shortKey ? shortT : fullT !== fullKey ? fullT : f.title);
          var tooltip = (fullT !== fullKey ? fullT : f.title);
          return `
          <div class="form-thumbnail ${idx === 0 ? "active" : ""}" data-form-key="${f.key}" role="button" tabindex="0" title="${String(tooltip).replace(/"/g, "&quot;")}">
            <div class="form-thumbnail-icon">📄</div>
            <div class="form-thumbnail-title">${label}</div>
          </div>
        `;
        }
      )
      .join("");

    // 하단: 양식 섹션 리스트 (입력 화면과 동일한 탭 UI: tab-pane + active)
    tabHost.innerHTML = forms
      .map(
        (f, idx) => {
          // PDF 템플릿 경로: forms/pdf/{번호}_pdf_{key}.html
          const formFileName = f.file.split('/').pop();
          const pdfFileName = formFileName.replace('_form_', '_pdf_');
          const pdfPath = `../forms/pdf/${pdfFileName}`;
          return `
          <div class="form-section-item tab-pane ${idx === 0 ? 'active' : ''}" data-form-key="${f.key}" id="form-${f.key}">
            <div class="form-section-content" data-form-path="${pdfPath}">
              <div class="form-loading" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <div style="margin-bottom: 12px; font-size: 14px;">양식을 불러오는 중...</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">데이터를 주입하는 중입니다. 잠시만 기다려주세요.</div>
              </div>
            </div>
          </div>
        `;
        }
      )
      .join("");

    // 입력 화면의 loadFormHTML 함수를 그대로 사용 (PDF 템플릿 경로만 전달)
    // 모든 PDF 템플릿 로드 (입력 화면과 동일한 방식)
    // DOM이 완전히 렌더링된 후 실행
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        try {
          if (!tabHost) {
            console.error('Review page: tabHost not found');
            return;
          }
          
          const formContents = qsa(".form-section-content", tabHost);
          console.log('Review page: Found form contents:', formContents.length);
          
          if (formContents.length === 0) {
            console.warn('Review page: No form contents found');
            return;
          }
          
          for (const contentEl of formContents) {
            const formPath = contentEl.getAttribute("data-form-path");
            const formItem = contentEl.closest(".form-section-item");
            const formKey = formItem ? formItem.getAttribute("data-form-key") : "";
            
            console.log('Review page: Loading form', { formKey, formPath });
            
            if (formPath) {
              try {
                // 입력 화면의 loadFormHTML 함수를 그대로 사용 (skipFillData 옵션으로 fillFormData 건너뛰기)
                const formWrapper = await loadFormHTML(contentEl, formPath, formKey, { skipFillData: true });
                
                console.log('Review page: Form loaded', { formKey, formPath, formWrapper: !!formWrapper });
                
                // PDF 템플릿에 데이터 주입 (loadFormHTML 후)
                // postMessage 방식으로 데이터 전송 (입력 화면과 동일)
                if (formWrapper) {
                  // formWrapper는 실제로 iframe 요소
                  const iframe = formWrapper;
                  
                  // 로딩 오버레이 생성 (데이터 수집 및 주입 중 표시)
                  const loadingOverlay = document.createElement('div');
                  loadingOverlay.className = 'form-loading-overlay';
                  loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 40px; text-align: center;';
                  contentEl.style.position = 'relative';
                  contentEl.appendChild(loadingOverlay);
                  
                  // 데이터 수집 (입력 화면에서 저장된 데이터 사용)
                  loadingOverlay.innerHTML = `
                    <div>
                      <div style="margin-bottom: 12px; font-size: 14px; color: var(--text-secondary);">데이터를 수집하는 중...</div>
                      <div style="font-size: 12px; color: var(--text-tertiary);">입력하신 내용을 불러오고 있습니다.</div>
                    </div>
                  `;
                  
                  const formData = await collectFormDataFromInput(formKey);
                  console.log('Review page: Injecting data via postMessage', { formKey, formData });
                  
                  // 디버깅: 라디오 버튼 및 체크박스 값 확인
                  console.log('Review page: Radio/Checkbox values:', {
                    'title': formData['title'],
                    'country-code': formData['country-code'],
                    'facial-frequency': formData['facial-frequency'],
                    'treatment-type': formData['treatment-type'],
                    'medical-aesthetic': formData['medical-aesthetic'],
                    'continuous-treatment': formData['continuous-treatment'],
                    'medication-products': formData['medication-products'],
                    'body-frequency': formData['body-frequency'],
                    'body-areas': formData['body-areas'],
                    'massage-pressure': formData['massage-pressure']
                  });
                  
                  // 로딩 화면 업데이트 (데이터 주입 중)
                  loadingOverlay.innerHTML = `
                    <div>
                      <div style="margin-bottom: 12px; font-size: 14px; color: var(--text-secondary);">데이터를 주입하는 중...</div>
                      <div style="font-size: 12px; color: var(--text-tertiary);">잠시만 기다려주세요.</div>
                    </div>
                  `;
                  
                  // postMessage로 데이터 전송 (PDF 템플릿의 메시지 리스너가 수신)
                  if (iframe && iframe.contentWindow) {
                    // 데이터 주입 완료 메시지 수신 리스너 등록
                    const handleInjectionComplete = (event) => {
                      if (event.data && event.data.type === 'form-data-injection-complete') {
                        const completedFormKey = event.data.formKey || '';
                        if (completedFormKey === formKey || !completedFormKey) {
                          // 로딩 오버레이 제거
                          if (loadingOverlay && loadingOverlay.parentElement) {
                            loadingOverlay.parentElement.removeChild(loadingOverlay);
                          }
                          // 리스너 제거
                          window.removeEventListener('message', handleInjectionComplete);
                        }
                      }
                    };
                    window.addEventListener('message', handleInjectionComplete);
                    
                    // iframe이 완전히 로드될 때까지 대기
                    const sendData = () => {
                      if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                          type: 'form-data-inject',
                          data: {
                            ...formData,
                            formKey: formKey
                          }
                        }, '*');
                      }
                    };
                    
                    // 즉시 전송
                    sendData();
                    
                    // DOMContentLoaded 후 전송 (스크립트 실행 후)
                    setTimeout(sendData, 100);
                    setTimeout(sendData, 300);
                    
                    // 타임아웃 안전장치: 2초 후에도 완료 메시지가 오지 않으면 로딩 화면 제거
                    setTimeout(() => {
                      if (loadingOverlay && loadingOverlay.parentElement) {
                        loadingOverlay.parentElement.removeChild(loadingOverlay);
                        window.removeEventListener('message', handleInjectionComplete);
                      }
                    }, 2000);
                  } else {
                    console.warn('Review page: Cannot send data: iframe or contentWindow is not available');
                    loadingOverlay.innerHTML = `
                      <div>
                        <div style="color: #ff3b30; font-size: 14px; margin-bottom: 8px;">오류 발생</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">데이터를 주입할 수 없습니다.</div>
                      </div>
                    `;
                  }
                } else {
                  // formWrapper가 null이면 에러 메시지 표시
                  console.error('Review page: Form wrapper is null', { formKey, formPath });
                  if (contentEl.querySelector('.form-loading')) {
                    contentEl.innerHTML = `
                      <div style="padding: 40px; text-align: center; color: #ff3b30;">
                        <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                          양식을 불러올 수 없습니다
                        </div>
                        <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                          양식 경로: ${formPath}
                        </div>
                        <div style="font-size: 12px; color: #999;">
                          콘솔을 확인하세요 (F12)
                        </div>
                      </div>
                    `;
                  }
                }
              } catch (error) {
                console.error('Review page: Error loading form', { formKey, formPath, error });
                // 에러 발생 시 에러 메시지 표시
                if (contentEl.querySelector('.form-loading') || contentEl.hasAttribute('data-loading')) {
                  contentEl.innerHTML = `
                    <div style="padding: 40px; text-align: center; color: #ff3b30;">
                      <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
                        양식을 불러오는 중 오류가 발생했습니다
                      </div>
                      <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
                        ${error.message || '알 수 없는 오류'}
                      </div>
                      <div style="font-size: 12px; color: #999;">
                        양식 경로: ${formPath}
                      </div>
                    </div>
                  `;
                  contentEl.removeAttribute('data-loading');
                }
              }
            } else {
              console.warn('Review page: No form path found', { formKey });
            }
          }
        } catch (error) {
          console.error('Review page: Error in form loading loop', error);
        }
      });
    });

    // 상단 썸네일 클릭 시 탭 전환 (내용입력 화면과 동일한 탭 UI)
    qsa(".form-thumbnail", tabMenu).forEach((thumb) => {
      thumb.addEventListener("click", function () {
        const formKey = this.getAttribute("data-form-key");
        
        // 상단 썸네일 활성화 상태 업데이트
        qsa(".form-thumbnail", tabMenu).forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
        
        // 하단 양식 섹션 탭 전환 (active만 표시)
        qsa(".form-section-item", tabHost).forEach((item) => {
          item.classList.remove("active");
        });
        const formSection = qs(`[data-form-key="${formKey}"]`, tabHost);
        if (formSection) {
          formSection.classList.add("active");
          // 탭 전환 시 스크롤을 맨 위로
          const scrollContainer = qs(".t-body");
          if (scrollContainer && scrollContainer.scrollTo) {
            scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      });
      
      // 키보드 접근성
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.click();
        }
      });
    });

    // 스크롤 시 현재 보이는 양식에 따라 썸네일 자동 활성화
    if (typeof IntersectionObserver !== 'undefined') {
      const observerOptions = {
        root: qs(".t-body"),
        rootMargin: '-20% 0px -60% 0px', // 상단 20% 지점에 들어오면 활성화
        threshold: 0
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const formKey = entry.target.getAttribute("data-form-key");
            const thumb = qs(`[data-form-key="${formKey}"]`, tabMenu);
            if (thumb) {
              // 썸네일 클릭으로 인한 스크롤이 아닐 때만 업데이트
              if (!thumb.classList.contains("active")) {
                qsa(".form-thumbnail", tabMenu).forEach((t) => t.classList.remove("active"));
                thumb.classList.add("active");
              }
            }
          }
        });
      }, observerOptions);

      // 모든 양식 섹션 관찰
      qsa(".form-section-item", tabHost).forEach(section => {
        observer.observe(section);
      });
    }

    // 고객 확인 섹션은 PDF에 주입되므로 화면에서 제거됨
    // 실명과 서명은 PDF 템플릿에 자동으로 주입됨

    // BC 정보 섹션 제거됨 (Step 2에서 이미 선택되었으므로 불필요)

    // 고객 전달 방법 선택 초기화
    const deliveryMethodList = qs("#delivery-method-list");
    if (deliveryMethodList) {
      const deliveryMethods = [
        { value: "email", label: "이메일 발송" },
        { value: "print", label: "출력" },
        { value: "none", label: "전달 안함" }
      ];
      
      const savedMethod = load(STORAGE.deliveryMethod, "none"); // 기본값: 전달 안함
      
      // 전달 방법 카드 렌더링
      deliveryMethodList.innerHTML = deliveryMethods
        .map(method => {
          const isSelected = savedMethod === method.value;
          return `
            <div class="delivery-method-card" data-method="${method.value}" style="border:1px solid ${isSelected ? "rgba(0, 122, 255, 0.65)" : "var(--border-light)"}; box-shadow: ${isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none"}; border-radius: var(--border-radius); padding: 12px; cursor: pointer; transition: all 0.2s; background: var(--bg-primary);">
              <div style="display:flex; align-items:center; gap: 12px;">
                <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: var(--border-radius); background: ${isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent"};">
                  ${isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : ''}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-weight: var(--font-weight-medium); color: var(--text-primary);">${method.label}</div>
                </div>
              </div>
            </div>
          `;
        })
        .join("");
      
      // 전달 방법 카드 클릭 이벤트
      qsa(".delivery-method-card", deliveryMethodList).forEach((card) => {
        card.addEventListener("click", function() {
          const methodValue = card.getAttribute("data-method");
          
          // 선택 상태 업데이트
          save(STORAGE.deliveryMethod, methodValue);
          
          // UI 업데이트
          qsa(".delivery-method-card", deliveryMethodList).forEach(c => {
            const isSelected = c.getAttribute("data-method") === methodValue;
            c.style.border = isSelected ? "1px solid rgba(0, 122, 255, 0.65)" : "1px solid var(--border-light)";
            c.style.boxShadow = isSelected ? "0 0 0 3px rgba(0, 122, 255, 0.10)" : "none";
            const iconArea = c.querySelector("div[style*='width: 36px']");
            if (iconArea) {
              iconArea.style.background = isSelected ? "rgba(0, 122, 255, 0.10)" : "transparent";
              iconArea.innerHTML = isSelected ? '<span style="color: var(--primary-color); font-size: 18px; font-weight: bold;">✓</span>' : '';
            }
          });
          
          const selectedMethod = deliveryMethods.find(m => m.value === methodValue);
          toast("전달 방법 선택됨", selectedMethod ? selectedMethod.label : "");
        });
      });
    }

    // 기타사항 입력 필드 초기화 (저장된 값이 있으면 복원)
    const bcNotes = qs("#bc-notes");
    if (bcNotes) {
      const savedNotes = load(STORAGE.bcNotes, "");
      if (savedNotes) {
        bcNotes.value = savedNotes;
      }
      // 입력 시 저장
      bcNotes.addEventListener("input", function() {
        save(STORAGE.bcNotes, this.value);
      });
    }

    const backBtn = qs("#back-to-input");
    if (backBtn) backBtn.addEventListener("click", () => navFlow("tabs"));

    const confirmBtn = qs("#confirm-next");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        // 완료 페이지로 이동 (기본값: 성공)
        // 테스트를 위해 오류 상태를 확인하려면 wrapper 페이지의 테스트 데이터 버튼 사용
        // BC 선택은 Step 2에서 이미 완료되었으므로 여기서는 검증하지 않음
        save(STORAGE.completionStatus, "success");
        navFlow("completion");
      });
    }
  }

  window.HKPOS.Pages = window.HKPOS.Pages || {};
  window.HKPOS.Pages.initReviewPage = initReviewPage;
})();
