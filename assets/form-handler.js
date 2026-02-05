/* ============================================
   HK POS eSignature - Form Handler
   - Form loading, data injection, data collection
   ============================================ */

(function () {
  'use strict';

  // 네임스페이스 확인
  if (!window.HKPOS) {
    window.HKPOS = {};
  }

  const STORAGE = window.HKPOS.STORAGE;
  const SAMPLE_STAFF = window.HKPOS.SAMPLE_STAFF;
  const Utils = window.HKPOS.Utils;

  // Utils 함수들을 로컬 변수로 추출
  if (!Utils) {
    throw new Error('Utils is not loaded. Make sure utils.js is loaded before form-handler.js');
  }
  const { load, save, formatDateHK, formatTimeHK, qs } = Utils;

  // ---------- iframe에서 양식 데이터 요청 ----------
  function requestFormDataFromIframe(formKey) {
    return new Promise((resolve, reject) => {
      if (!window.formIframes || !window.formIframes.has(formKey)) {
        console.warn(`[App] Iframe not found for form: ${formKey}`);
        resolve({});
        return;
      }
      
      const iframe = window.formIframes.get(formKey);
      if (!iframe || !iframe.contentWindow) {
        console.warn(`[App] Iframe contentWindow not available for form: ${formKey}`);
        resolve({});
        return;
      }
      
      // 핸들러 등록 (데이터 수집 완료 시 호출)
      if (!window.iframeMessageHandlers) {
        window.iframeMessageHandlers = new Map();
      }
      
      const timeout = setTimeout(() => {
        window.iframeMessageHandlers.delete(formKey);
        console.warn(`[App] Timeout waiting for form data from: ${formKey}`);
        resolve({});
      }, 3000); // 3초 타임아웃
      
      window.iframeMessageHandlers.set(formKey, (data) => {
        clearTimeout(timeout);
        resolve(data);
      });
      
      // iframe에 데이터 수집 요청
      iframe.contentWindow.postMessage({
        type: 'form-data-request',
        formKey: formKey
      }, '*');
    });
  }

  // ---------- iframe에 데이터 전송 ----------
  function sendDataToForm(iframe, formKey) {
    try {
      const customer = load(STORAGE.customer, null);
      const currentStaff = load(STORAGE.staff, null);
      const reviewStaffId = load(STORAGE.reviewStaff, '');
      
      const now = new Date();
      const dateStr = formatDateHK(now);
      const timeStr = formatTimeHK(now);
      
      // 담당 직원 정보
      let responsibleStaffName = '';
      if (reviewStaffId) {
        const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
        if (reviewStaff) {
          responsibleStaffName = reviewStaff.name;
        }
      } else if (currentStaff) {
        responsibleStaffName = currentStaff.name;
      }
      
      // 브랜드명 및 로고 이미지 파일명 (로그인 매장의 brandCd)
      const brandName = (window.HKPOS && window.HKPOS.BRAND_BY_CODE && currentStaff && currentStaff.brandCd)
        ? (window.HKPOS.BRAND_BY_CODE[currentStaff.brandCd] || 'Sulwhasoo')
        : 'Sulwhasoo';
      const brandLogoFilename = (window.HKPOS && window.HKPOS.BRAND_LOGO_IMAGE && currentStaff && currentStaff.brandCd)
        ? window.HKPOS.BRAND_LOGO_IMAGE[currentStaff.brandCd]
        : '';

      // 전송할 데이터 구성
      const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const formData = {
        type: 'form-data-inject',
        formKey: formKey,
        data: {
          'store-registration': currentStaff && currentStaff.storeName ? currentStaff.storeName : '',
          'responsible-staff': responsibleStaffName,
          'brand-name': brandName,
          'brand-logo-filename': brandLogoFilename,
          'customer-name': customer ? customer.name : '',
          'membership-number': customer ? customer.id : '',
          'title': customer ? customer.title : '',
          'country-code': customer ? customer.countryCode : '',
          'contact-number': customer ? customer.phone : '',
          'email': customer ? customer.email : '',
          'signature-date': dateStr,
          'signature-time': timeStr
        }
      };

      // 02-05 시술 전환 확인서: 문서 ID, 양도 회원(실명 우선), 패키지 목록, 수령 회원 후보
      if (formKey === 'treatment-conversion') {
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['document-id'] = 'TCAL-' + storeId + '-' + yyyymmdd + '-001';
        formData.data['transfer-member-no'] = customer ? customer.id : '';
        formData.data['transfer-member-name'] = customer ? (customerRealName || customer.name || '') : '';
        const sampleCustomers = window.HKPOS.SAMPLE_CUSTOMERS || [];
        const fullCustomer = customer && customer.id ? sampleCustomers.find(function (c) { return c.id === customer.id; }) : null;
        formData.data['transfer-member-packages'] = fullCustomer && fullCustomer.availablePackages ? fullCustomer.availablePackages : [];
        formData.data['receiving-member-candidates'] = sampleCustomers.filter(function (c) { return c.id !== (customer ? customer.id : ''); }).map(function (c) { return { id: c.id, name: c.name }; });
      }

      // 02-06 시술 연기 확인서: 문서 ID, 회원(실명 우선), 매장 위치(=매장명), 연장 대상 패키지 목록
      if (formKey === 'treatment-extension') {
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['document-id'] = 'TEAL-' + storeId + '-' + yyyymmdd + '-001';
        formData.data['member-no'] = customer ? customer.id : '';
        formData.data['member-name'] = customer ? (customerRealName || customer.name || '') : '';
        formData.data['store-location'] = currentStaff && currentStaff.storeName ? currentStaff.storeName : '';
        const sampleCustomers = window.HKPOS.SAMPLE_CUSTOMERS || [];
        const fullCustomer = customer && customer.id ? sampleCustomers.find(function (c) { return c.id === customer.id; }) : null;
        formData.data['extension-packages'] = fullCustomer && fullCustomer.availablePackages ? fullCustomer.availablePackages : [];
      }

      // 03-01 구매 시술 패키지 및 제품 패키지 약관: 고객명 실명 우선 (01-01과 동일 5항목)
      if (formKey === 'package-terms') {
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['customer-name'] = customer ? (customerRealName || customer.name || '') : '';
      }

      // 03-02 구매 Collagen Drink 약관: 고객명 실명 우선 (03-01과 동일)
      if (formKey === 'collagen-drink-terms') {
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['customer-name'] = customer ? (customerRealName || customer.name || '') : '';
      }

      // 04-01 고객 환불 확인서: 고객명 실명 우선, 문서 ID RAL-{storeId}-YYYYMMDD-001 (Store/Staff 미표시)
      if (formKey === 'customer-refund') {
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['customer-name'] = customer ? (customerRealName || customer.name || '') : '';
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        formData.data['document-id'] = 'RAL-' + storeId + '-' + yyyymmdd + '-001';
      }

      // 04-02 예약 취소 면제서: 고객명 실명 우선, 문서 ID TCEL-{storeId}-YYYYMMDD-001
      if (formKey === 'appointment-cancellation-waiver') {
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['customer-name'] = customer ? (customerRealName || customer.name || '') : '';
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        formData.data['document-id'] = 'TCEL-' + storeId + '-' + yyyymmdd + '-001';
      }

      // 04-03 교환 제품 배송 확인서: 고객명 실명 우선, 문서 ID DC-{storeId}-YYYYMMDD-001
      if (formKey === 'product-exchange-delivery') {
        const customerRealName = load(STORAGE.customerRealName, '');
        formData.data['customer-name'] = customer ? (customerRealName || customer.name || '') : '';
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        formData.data['document-id'] = 'DC-' + storeId + '-' + yyyymmdd + '-001';
      }

      // 05-01 위임장: 문서 ID AL-{storeId}-YYYYMMDD-001, 위임자=현재 회원(실명 우선), 피위임자 후보
      if (formKey === 'authorization-letter') {
        const customerRealName = load(STORAGE.customerRealName, '');
        const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
        formData.data['document-id'] = 'AL-' + storeId + '-' + yyyymmdd + '-001';
        formData.data['delegator-name'] = customer ? (customerRealName || customer.name || '') : '';
        formData.data['delegator-membership-no'] = customer ? customer.id : '';
        formData.data['delegator-title'] = customer ? customer.title : '';
        formData.data['delegator-country-code'] = customer ? customer.countryCode : '';
        formData.data['delegator-contact'] = customer ? customer.phone : '';
        formData.data['delegator-email'] = customer ? customer.email : '';
        const sampleCustomers = window.HKPOS.SAMPLE_CUSTOMERS || [];
        const currentId = customer ? customer.id : '';
        formData.data['delegatee-candidates'] = sampleCustomers
          .filter(function (c) { return c.id !== currentId; })
          .map(function (c) {
            return {
              id: c.id,
              name: c.name,
              phone: c.phone,
              countryCode: c.countryCode
            };
          });
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        formData.data['validity-start'] = todayStr;
        formData.data['validity-end'] = todayStr;
      }

      // iframe에 데이터 전송
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(formData, '*');
      } else {
        console.warn('[App] Cannot send data: iframe or contentWindow is not available');
      }
    } catch (e) {
      console.error('[App] Error sending data to form:', e);
    }
  }
  
  // ---------- PDF 템플릿용 데이터 주입 함수 (formWrapper 직접 접근) ----------
  // 주의: 입력 화면은 iframe + postMessage 방식 사용, 이 함수는 PDF 템플릿에서만 사용
  function fillFormData(formWrapper, customer, formKey) {
    const now = new Date();
    const dateStr = formatDateHK(now);
    const timeStr = formatTimeHK(now);
    
    // 매장 정보 (Store Registration)
    const storeField = formWrapper.querySelector('[data-field="store-registration"]');
    if (storeField) {
      const currentStaff = load(STORAGE.staff, null);
      if (currentStaff && currentStaff.storeName) {
        storeField.value = currentStaff.storeName;
      }
    }
    
    // 담당 직원 정보 (Responsible Staff)
    const staffField = formWrapper.querySelector('[data-field="responsible-staff"]');
    if (staffField) {
      const reviewStaffId = load(STORAGE.reviewStaff, '');
      if (reviewStaffId) {
        const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
        if (reviewStaff) {
          staffField.value = reviewStaff.name;
        }
      } else {
        // reviewStaff가 없으면 현재 로그인한 직원 정보 사용
        const currentStaff = load(STORAGE.staff, null);
        if (currentStaff) {
          staffField.value = currentStaff.name;
        }
      }
    }
    
    // 고객명
    const nameInput = formWrapper.querySelector('#customer-name');
    if (nameInput && customer.name) {
      nameInput.value = customer.name;
    }
    
    // 호칭 (Title)
    if (customer.title) {
      const titleRadio = formWrapper.querySelector(`input[name="title"][value="${customer.title}"]`);
      if (titleRadio) {
        titleRadio.checked = true;
      }
    }
    
    // 회원번호
    const membershipInput = formWrapper.querySelector('#membership-number');
    if (membershipInput && customer.id) {
      membershipInput.value = customer.id;
    }
    
    // 국가번호 (Country Code)
    if (customer.countryCode) {
      const countryCodeRadio = formWrapper.querySelector(`input[name="country-code"][value="${customer.countryCode}"]`);
      if (countryCodeRadio) {
        countryCodeRadio.checked = true;
      }
    }
    
    // 연락처
    const contactInput = formWrapper.querySelector('#contact-number');
    if (contactInput && customer.phone) {
      contactInput.value = customer.phone;
    }
    
    // 이메일
    const emailInput = formWrapper.querySelector('#email');
    if (emailInput && customer.email) {
      emailInput.value = customer.email;
    }
    
    // 서명 날짜 (DD-MM-YYYY 형식, 텍스트 필드)
    const signatureDateInput = formWrapper.querySelector('#signature-date');
    if (signatureDateInput) {
      signatureDateInput.value = dateStr;
    }
    
    // 서명 시간 (HH:MM 형식)
    const signatureTimeInput = formWrapper.querySelector('#signature-time');
    if (signatureTimeInput) {
      signatureTimeInput.value = timeStr;
    }
    
    // 일반 날짜 입력 필드들에 오늘 날짜 기본값 설정 (DD-MM-YYYY 형식)
    const recentTreatmentDateInput = formWrapper.querySelector('#recent-treatment-date');
    if (recentTreatmentDateInput && !recentTreatmentDateInput.value) {
      recentTreatmentDateInput.value = dateStr;
    }
    
    const medicationDurationFromInput = formWrapper.querySelector('#medication-duration-from');
    if (medicationDurationFromInput && !medicationDurationFromInput.value) {
      medicationDurationFromInput.value = dateStr;
    }
    
    const medicationDurationToInput = formWrapper.querySelector('#medication-duration-to');
    if (medicationDurationToInput && !medicationDurationToInput.value) {
      medicationDurationToInput.value = dateStr;
    }
  }

  // ---------- iframe 방식으로 양식 로드 ----------
  // 반환: Promise<iframe | null> — iframe 로드 완료 시 resolve (이미 로드된 경우 즉시 resolve)
  async function loadFormHTML(formContentEl, formPath, formKey, options = {}) {
    // 이미 로드된 경우: 즉시 resolve
    if (formContentEl.hasAttribute('data-loaded')) {
      const iframe = (window.formIframes && window.formIframes.get(formKey)) || null;
      return Promise.resolve(iframe);
    }
    // 로딩 중인 경우: 기존 Promise 반환 (동일 contentEl에서 대기)
    if (formContentEl.hasAttribute('data-loading')) {
      const p = formContentEl._loadPromise;
      return p ? p : Promise.resolve(null);
    }
    
    formContentEl.setAttribute('data-loading', 'true');
    formContentEl._loadPromise = new Promise(function (resolve) {
      formContentEl._loadResolve = resolve;
    });
    
    try {
      // iframe 요소 생성
      const iframe = document.createElement('iframe');
      iframe.id = `form-iframe-${formKey}`;
      iframe.style.cssText = 'width: 100%; height: 500px; border: none; display: block; overflow: hidden;';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('frameborder', '0');
      
      // postMessage 수신: iframe 높이 조정 및 데이터 수집
      const handleMessage = function(event) {
        
        if (event.data && event.data.type === 'iframe-resize') {
          try {
            if (event.source === iframe.contentWindow) {
              const height = event.data.height;
              if (height && height > 0) {
                iframe.style.height = height + 'px';
              }
            }
          } catch (e) {
            // cross-origin 에러 무시
          }
        }
        
        // form-data-collected 메시지 처리
        if (event.data && event.data.type === 'form-data-collected') {
          try {
            const collectedFormKey = event.data.formKey;
            const collectedData = event.data.data || {};
            
            // 데이터를 localStorage에 저장
            const savedConditionalData = load(STORAGE.conditionalFormData, {});
            if (!savedConditionalData[collectedFormKey]) {
              savedConditionalData[collectedFormKey] = {};
            }
            Object.assign(savedConditionalData[collectedFormKey], collectedData);
            save(STORAGE.conditionalFormData, savedConditionalData);
            
            // 핸들러가 등록되어 있으면 호출 (Promise resolve)
            if (window.iframeMessageHandlers && window.iframeMessageHandlers.has(collectedFormKey)) {
              const handler = window.iframeMessageHandlers.get(collectedFormKey);
              if (handler) {
                handler(collectedData);
                window.iframeMessageHandlers.delete(collectedFormKey);
              }
            }
          } catch (e) {
            console.error('[App] Error handling form data collection:', e);
          }
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // iframe 참조를 저장하여 나중에 데이터 수집 요청 시 사용
      if (!window.formIframes) {
        window.formIframes = new Map();
      }
      window.formIframes.set(formKey, iframe);
      
      // iframe 로드 완료 대기
      iframe.addEventListener('load', function() {
        // 404 에러 체크: iframe의 contentDocument가 없거나 에러 페이지인 경우
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const isErrorPage = iframeDoc.body && (
            iframeDoc.body.textContent.includes('404') || 
            iframeDoc.body.textContent.includes('Not Found') ||
            iframeDoc.title.includes('404')
          );
          
          if (isErrorPage) {
            console.warn(`[App] Form file not found (404): ${formPath}`);
            formContentEl.removeAttribute('data-loading');
            formContentEl.innerHTML = `
              <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
                  양식 파일을 찾을 수 없습니다
                </div>
                <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
                  양식 경로: ${formPath}
                </div>
                <div style="font-size: 12px; color: var(--text-tertiary);">
                  이 양식은 아직 구현되지 않았습니다.
                </div>
              </div>
            `;
            if (formContentEl._loadResolve) {
              formContentEl._loadResolve(null);
              formContentEl._loadResolve = null;
            }
            return;
          }
        } catch (e) {
          // cross-origin 에러는 무시
          console.warn(`[App] Cannot check iframe content (may be cross-origin): ${formPath}`);
        }
        
        formContentEl.removeAttribute('data-loading');
        formContentEl.setAttribute('data-loaded', 'true');
        
        // 로딩 오버레이 제거
        if (iframe._loadingOverlay && iframe._loadingOverlay.parentElement) {
          iframe._loadingOverlay.parentElement.removeChild(iframe._loadingOverlay);
        }
        
        // load 완료 Promise resolve (확인 화면에서 미로드 양식 먼저 로드 후 수집 시 사용)
        if (formContentEl._loadResolve) {
          formContentEl._loadResolve(iframe);
          formContentEl._loadResolve = null;
        }
        
        // 데이터 주입
        if (!options.skipFillData) {
          // iframe이 완전히 로드된 후 데이터 전송
          setTimeout(() => {
            sendDataToForm(iframe, formKey);
          }, 100);
        }
      });
      
      // iframe 로드 에러 처리 (404 등)
      iframe.addEventListener('error', function() {
        console.warn(`[App] Form iframe load error: ${formPath}`);
        formContentEl.removeAttribute('data-loading');
        formContentEl.innerHTML = `
          <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: var(--text-primary);">
              양식을 불러올 수 없습니다
            </div>
            <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 8px;">
              양식 경로: ${formPath}
            </div>
            <div style="font-size: 12px; color: var(--text-tertiary);">
              이 양식은 아직 구현되지 않았습니다.
            </div>
          </div>
        `;
        if (formContentEl._loadResolve) {
          formContentEl._loadResolve(null);
          formContentEl._loadResolve = null;
        }
      });
      
      // iframe에 src 설정
      iframe.src = formPath;
      
      // 부모 컨테이너에 스크롤 활성화 (iframe 내부 스크롤 대신 부모에서 스크롤)
      if (formContentEl.classList.contains('form-section-content')) {
        formContentEl.style.overflow = 'auto';
        formContentEl.style.overflowX = 'hidden';
      }
      
      // iframe 삽입 (로딩 화면은 유지 - 오버레이로 표시)
      const existingLoading = formContentEl.querySelector('.form-loading');
      formContentEl.innerHTML = '';
      formContentEl.appendChild(iframe);
      
      // 로딩 오버레이 추가 (iframe 위에 표시)
      const loadingOverlay = document.createElement('div');
      loadingOverlay.className = 'form-loading-overlay';
      loadingOverlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.95); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 40px; text-align: center;';
      loadingOverlay.innerHTML = `
        <div>
          <div style="margin-bottom: 12px; font-size: 14px; color: var(--text-secondary);">양식을 불러오는 중...</div>
          <div style="font-size: 12px; color: var(--text-tertiary);">잠시만 기다려주세요.</div>
        </div>
      `;
      formContentEl.style.position = 'relative';
      formContentEl.appendChild(loadingOverlay);
      
      // iframe 로드 완료 후 오버레이 제거 (loadFormHTML의 load 이벤트에서 처리)
      // 오버레이 참조를 iframe에 저장하여 나중에 제거할 수 있도록 함
      iframe._loadingOverlay = loadingOverlay;
      
      return formContentEl._loadPromise;
    } catch (error) {
      formContentEl.removeAttribute('data-loading');
      if (formContentEl._loadResolve) {
        formContentEl._loadResolve(null);
        formContentEl._loadResolve = null;
      }
      console.error('Error loading form:', error, 'Path:', formPath);
      formContentEl.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #ff3b30;">
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
            양식을 불러오는 중 오류가 발생했습니다.
          </div>
          <div style="font-size: 14px; color: #666;">
            ${error.message || '알 수 없는 오류'}
          </div>
        </div>
      `;
      return Promise.resolve(null);
    }
  }

  // ---------- 입력 양식에서 데이터 수집 (iframe 방식 우선, 폴백으로 formWrapper 직접 접근) ----------
  // 주의: 입력 화면은 iframe 방식 사용, 폴백은 PDF 템플릿용. 확인 화면에서는 PDF iframe이므로 localStorage 우선 사용(3초 대기 방지).
  async function collectFormDataFromInput(formKey) {
    var isPdfIframe = false;
    if (window.formIframes && window.formIframes.has(formKey)) {
      var iframe = window.formIframes.get(formKey);
      var src = (iframe && (iframe.src || (iframe.getAttribute && iframe.getAttribute('src')))) || '';
      if (src.indexOf('_pdf_') !== -1 || src.indexOf('/pdf/') !== -1) {
        isPdfIframe = true;
      }
    }
    // iframe 방식으로 데이터 수집 시도 (입력 화면만; PDF iframe은 form-data-request에 응답하지 않으므로 건너뜀)
    if (!isPdfIframe && window.formIframes && window.formIframes.has(formKey)) {
      try {
        const formData = await requestFormDataFromIframe(formKey);
        if (formData && Object.keys(formData).length > 0) {
          // 실명이 있으면 고객명을 실명으로 덮어쓰기 (법적 효력 요건)
          const customerRealName = load(STORAGE.customerRealName, '');
          if (customerRealName) {
            formData['customer-name'] = customerRealName;
          }
          // 브랜드명·로고 위치: 로그인 매장 기준으로 항상 주입 (리뷰 PDF 등)
          const currentStaff = load(STORAGE.staff, null);
          formData['brand-name'] = (window.HKPOS && window.HKPOS.BRAND_BY_CODE && currentStaff && currentStaff.brandCd)
            ? (window.HKPOS.BRAND_BY_CODE[currentStaff.brandCd] || 'Sulwhasoo')
            : 'Sulwhasoo';
          formData['brand-logo-filename'] = (window.HKPOS && window.HKPOS.BRAND_LOGO_IMAGE && currentStaff && currentStaff.brandCd)
            ? window.HKPOS.BRAND_LOGO_IMAGE[currentStaff.brandCd]
            : '';
          return formData;
        }
      } catch (e) {
        console.error(`[App] Error collecting form data from iframe: ${formKey}`, e);
      }
    }
    
    // 폴백: localStorage + 고객/매장 정보 (PDF 템플릿 확인 화면 또는 iframe 미응답 시)
    const formData = {};
    const customer = load(STORAGE.customer, null);
    const currentStaff = load(STORAGE.staff, null);
    const reviewStaffId = load(STORAGE.reviewStaff, '');
    if (currentStaff) {
      formData['store-registration'] = currentStaff.storeName || '';
      if (reviewStaffId) {
        const reviewStaff = SAMPLE_STAFF.find(function (s) { return s.staffId === reviewStaffId; });
        formData['responsible-staff'] = reviewStaff ? reviewStaff.name : '';
      } else {
        formData['responsible-staff'] = currentStaff.name || '';
      }
      // 브랜드명·로고 위치: 로그인 매장의 brandCd (리뷰 PDF 등)
      formData['brand-name'] = (window.HKPOS && window.HKPOS.BRAND_BY_CODE && currentStaff.brandCd)
        ? (window.HKPOS.BRAND_BY_CODE[currentStaff.brandCd] || 'Sulwhasoo')
        : 'Sulwhasoo';
      formData['brand-logo-filename'] = (window.HKPOS && window.HKPOS.BRAND_LOGO_IMAGE && currentStaff.brandCd)
        ? window.HKPOS.BRAND_LOGO_IMAGE[currentStaff.brandCd]
        : '';
    } else {
      formData['brand-name'] = 'Sulwhasoo';
      formData['brand-logo-filename'] = '';
    }
    
    // 입력 양식에서 직접 값 수집 시도 (현재 활성화된 탭의 양식) - PDF 템플릿용
    const activeFormItem = qs(`.form-section-item[data-form-key="${formKey}"].active, .form-section-item[data-form-key="${formKey}"]`);
    let formWrapper = null;
    if (activeFormItem) {
      formWrapper = activeFormItem.querySelector('.form-wrapper');
    }
    
    // 고객 정보 (실명 우선, 없으면 POS 데이터 사용)
    const customerRealName = load(STORAGE.customerRealName, '');
    if (customer) {
      // 실명이 입력된 경우 실명을 사용, 없으면 POS 데이터의 이름 사용
      formData['customer-name'] = customerRealName || customer.name || '';
      
      // 호칭 (Title) - 저장된 값 우선, 없으면 입력 양식에서 선택된 값, 없으면 POS 데이터 사용
      const savedTitle = load(STORAGE.formTitle, '');
      if (savedTitle) {
        formData['title'] = savedTitle;
      } else if (formWrapper) {
        const titleRadio = formWrapper.querySelector('input[name="title"]:checked');
        if (titleRadio) {
          formData['title'] = titleRadio.value;
        } else {
          formData['title'] = customer.title || '';
        }
      } else {
        formData['title'] = customer.title || '';
      }
      
      formData['membership-number'] = customer.id || '';
      
      // 국가번호 (Country Code) - 저장된 값 우선, 없으면 입력 양식에서 선택된 값, 없으면 POS 데이터 사용
      const savedCountryCode = load(STORAGE.formCountryCode, '');
      if (savedCountryCode) {
        formData['country-code'] = savedCountryCode;
      } else if (formWrapper) {
        const countryCodeRadio = formWrapper.querySelector('input[name="country-code"]:checked');
        if (countryCodeRadio) {
          formData['country-code'] = countryCodeRadio.value;
        } else {
          formData['country-code'] = customer.countryCode || '';
        }
      } else {
        formData['country-code'] = customer.countryCode || '';
      }
      
      // 연락처 - 입력 양식에서 입력된 값 우선, 없으면 POS 데이터 사용
      if (formWrapper) {
        const contactInput = formWrapper.querySelector('#contact-number');
        if (contactInput && contactInput.value) {
          formData['contact-number'] = contactInput.value;
        } else {
          formData['contact-number'] = customer.phone || '';
        }
      } else {
        formData['contact-number'] = customer.phone || '';
      }
      
      // 이메일 - 입력 양식에서 입력된 값 우선, 없으면 POS 데이터 사용
      if (formWrapper) {
        const emailInput = formWrapper.querySelector('#email');
        if (emailInput && emailInput.value) {
          formData['email'] = emailInput.value;
        } else {
          formData['email'] = customer.email || '';
        }
      } else {
        formData['email'] = customer.email || '';
      }
    }
    
    // 입력 화면에서 수집한 전체 데이터 가져오기 (localStorage에서)
    // tabs.js에서 requestFormDataFromIframe으로 수집한 전체 데이터가 저장되어 있음
    const savedFormData = load(STORAGE.conditionalFormData, {});
    if (savedFormData[formKey]) {
      // 저장된 전체 데이터를 먼저 적용 (라디오, 체크박스, 조건부 필드 모두 포함)
      Object.assign(formData, savedFormData[formKey]);
    }
    
    // 실명이 있으면 고객명을 실명으로 덮어쓰기 (법적 효력 요건 - 저장된 데이터에 POS 이름이 있을 수 있음)
    if (customerRealName) {
      formData['customer-name'] = customerRealName;
    } else if (!formData['customer-name'] && customer) {
      // 실명이 없고 formData에도 없으면 POS 데이터 사용
      formData['customer-name'] = customer.name || '';
    }
    
    // 2. 입력 양식에서 직접 읽기 (입력 화면에서만 가능)
    if (formWrapper) {
      // Treatment type others
      const treatmentOthersInput = formWrapper.querySelector('#treatment-others-input input');
      if (treatmentOthersInput && treatmentOthersInput.value) {
        formData['treatment-type-others'] = treatmentOthersInput.value;
      }
      
      // Medical aesthetic details
      const medicalAestheticInput = formWrapper.querySelector('#medical-aesthetic-input input');
      if (medicalAestheticInput && medicalAestheticInput.value) {
        formData['medical-aesthetic-details'] = medicalAestheticInput.value;
      }
      
      // Medication products details
      const medicationProductsInput = formWrapper.querySelector('#medication-products-input input');
      if (medicationProductsInput && medicationProductsInput.value) {
        formData['medication-products-details'] = medicationProductsInput.value;
      }
      
      // Medication duration (from/to)
      const medicationDurationFrom = formWrapper.querySelector('#medication-duration-from');
      if (medicationDurationFrom && medicationDurationFrom.value) {
        formData['medication-duration-from'] = medicationDurationFrom.value;
      }
      const medicationDurationTo = formWrapper.querySelector('#medication-duration-to');
      if (medicationDurationTo && medicationDurationTo.value) {
        formData['medication-duration-to'] = medicationDurationTo.value;
      }
      
      // Body treatment type
      const bodyTreatmentTypeBlock = formWrapper.querySelector('#body-treatment-type-block');
      if (bodyTreatmentTypeBlock && bodyTreatmentTypeBlock.style.display !== 'none') {
        const bodyTreatmentTypeInput = bodyTreatmentTypeBlock.querySelector('input');
        if (bodyTreatmentTypeInput && bodyTreatmentTypeInput.value) {
          formData['body-treatment-type'] = bodyTreatmentTypeInput.value;
        }
      }
      
      // Massage pressure others
      const massagePressureInput = formWrapper.querySelector('#massage-pressure-input input');
      if (massagePressureInput && massagePressureInput.value) {
        formData['massage-pressure-others'] = massagePressureInput.value;
      }
      
      // Injuries details
      const injuriesInput = formWrapper.querySelector('#injuries-input input');
      if (injuriesInput && injuriesInput.value) {
        formData['injuries-details'] = injuriesInput.value;
      }
      
      // Surgeries details
      const surgeriesInput = formWrapper.querySelector('#surgeries-input input');
      if (surgeriesInput && surgeriesInput.value) {
        formData['surgeries-details'] = surgeriesInput.value;
      }
      
      // Long-term medication details
      const longTermMedicationInput = formWrapper.querySelector('#long-term-medication-input input');
      if (longTermMedicationInput && longTermMedicationInput.value) {
        formData['long-term-medication-details'] = longTermMedicationInput.value;
      }
      
      // Allergies details
      const allergiesInput = formWrapper.querySelector('#allergies-input input');
      if (allergiesInput && allergiesInput.value) {
        formData['allergies-details'] = allergiesInput.value;
      }
      
      // Chronic conditions others
      const chronicConditionsInput = formWrapper.querySelector('#chronic-conditions-input input');
      if (chronicConditionsInput && chronicConditionsInput.value) {
        formData['chronic-conditions-others'] = chronicConditionsInput.value;
      }
    }
    
    // 02-05 시술 전환 확인서: 폴백 시 문서 ID·양도 회원 정보 (리뷰 PDF용). 양도회원 이름은 입력화면 실명 우선 적용
    if (formKey === 'treatment-conversion') {
      const now = new Date();
      const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'TCAL-' + storeId + '-' + yyyymmdd + '-001';
      if (!formData['transfer-member-no'] && customer) formData['transfer-member-no'] = customer.id || '';
      // 실명(입력화면에서 입력한 이름) 우선, 없으면 폼에 채워진 값, 없으면 POS 고객명
      formData['transfer-member-name'] = customerRealName || formData['transfer-member-name'] || (customer ? customer.name : '') || '';
    }

    // 02-06 시술 연기 확인서: 폴백 시 문서 ID·회원 정보 (리뷰 PDF용). 회원명은 입력화면 실명 우선 적용
    if (formKey === 'treatment-extension') {
      const now = new Date();
      const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'TEAL-' + storeId + '-' + yyyymmdd + '-001';
      if (!formData['member-no'] && customer) formData['member-no'] = customer.id || '';
      formData['member-name'] = customerRealName || formData['member-name'] || (customer ? customer.name : '') || '';
      if (!formData['store-location'] && currentStaff && currentStaff.storeName) formData['store-location'] = currentStaff.storeName;
    }

    // 03-01 구매 시술 패키지 및 제품 패키지 약관: 고객명 실명 우선 (01-01과 동일)
    if (formKey === 'package-terms') {
      formData['customer-name'] = customerRealName || formData['customer-name'] || (customer ? customer.name : '') || '';
    }

    // 03-02 구매 Collagen Drink 약관: 고객명 실명 우선, 문서 ID CDTNC-{storeId}-YYYYMMDD-001
    if (formKey === 'collagen-drink-terms') {
      formData['customer-name'] = customerRealName || formData['customer-name'] || (customer ? customer.name : '') || '';
      const nowCD = new Date();
      const yyyymmddCD = `${nowCD.getFullYear()}${String(nowCD.getMonth() + 1).padStart(2, '0')}${String(nowCD.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'CDTNC-' + storeId + '-' + yyyymmddCD + '-001';
    }

    // 04-01 고객 환불 확인서: 고객명 실명 우선, 문서 ID RAL-{storeId}-YYYYMMDD-001
    if (formKey === 'customer-refund') {
      formData['customer-name'] = customerRealName || formData['customer-name'] || (customer ? customer.name : '') || '';
      const nowRAL = new Date();
      const yyyymmddRAL = `${nowRAL.getFullYear()}${String(nowRAL.getMonth() + 1).padStart(2, '0')}${String(nowRAL.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'RAL-' + storeId + '-' + yyyymmddRAL + '-001';
      // refund-method may be array from form; ensure it is available for PDF
      if (!formData['refund-method'] && formData['refund-method-other']) {
        formData['refund-method'] = ['Other', formData['refund-method-other']];
      }
    }

    // 04-02 예약 취소 면제서: 고객명 실명 우선, 문서 ID TCEL-{storeId}-YYYYMMDD-001
    if (formKey === 'appointment-cancellation-waiver') {
      formData['customer-name'] = customerRealName || formData['customer-name'] || (customer ? customer.name : '') || '';
      const nowTCEL = new Date();
      const yyyymmddTCEL = `${nowTCEL.getFullYear()}${String(nowTCEL.getMonth() + 1).padStart(2, '0')}${String(nowTCEL.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'TCEL-' + storeId + '-' + yyyymmddTCEL + '-001';
    }

    // 04-03 교환 제품 배송 확인서: 고객명 실명 우선, 문서 ID DC-{storeId}-YYYYMMDD-001
    if (formKey === 'product-exchange-delivery') {
      formData['customer-name'] = customerRealName || formData['customer-name'] || (customer ? customer.name : '') || '';
      const nowDC = new Date();
      const yyyymmddDC = `${nowDC.getFullYear()}${String(nowDC.getMonth() + 1).padStart(2, '0')}${String(nowDC.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'DC-' + storeId + '-' + yyyymmddDC + '-001';
    }

    // 05-01 위임장: 문서 ID AL-{storeId}-YYYYMMDD-001, 위임자 실명 우선, PDF용 delegator-contact-email (국가번호 + 전화번호)
    if (formKey === 'authorization-letter') {
      formData['delegator-name'] = customerRealName || formData['delegator-name'] || (customer ? customer.name : '') || '';
      const nowAL = new Date();
      const yyyymmddAL = `${nowAL.getFullYear()}${String(nowAL.getMonth() + 1).padStart(2, '0')}${String(nowAL.getDate()).padStart(2, '0')}`;
      const storeId = currentStaff && currentStaff.storeId ? currentStaff.storeId : '';
      if (!formData['document-id']) formData['document-id'] = 'AL-' + storeId + '-' + yyyymmddAL + '-001';
      var delegatorCc = formData['delegator-country-code'] || '';
      var delegatorPhone = formData['delegator-contact'] || '';
      var delegatorContactFormatted = (delegatorCc && delegatorPhone) ? ('(' + delegatorCc + ') ' + delegatorPhone) : delegatorPhone;
      var delegatorEmail = formData['delegator-email'] || '';
      formData['delegator-contact-email'] = delegatorEmail ? (delegatorContactFormatted + ' / ' + delegatorEmail) : delegatorContactFormatted;
    }

    // 서명 정보
    const signature = load(STORAGE.signature, null);
    if (signature && signature.dataUrl) {
      formData['signature-image'] = signature.dataUrl;
    }
    
    // 서명 날짜/시간
    const now = new Date();
    formData['signature-date'] = formatDateHK(now);
    formData['signature-time'] = formatTimeHK(now);
    
    return formData;
  }

  // ---------- PDF 템플릿에 데이터 주입 (PDF 생성 전용) ----------
  // 주의: 이 함수는 서버 측 PDF 생성 시에만 사용됩니다.
  // 확인 화면(review.js)에서는 postMessage 방식을 사용하므로 이 함수를 사용하지 않습니다.
  // formWrapper: PDF 템플릿의 DOM 요소 (iframe의 contentDocument.body 또는 직접 DOM 요소)
  function injectPDFDataToTemplate(formWrapper, formData, formKey) {
    // PDF 템플릿 내부의 injectPDFData 함수 호출 (formWrapper 내부에서만 작동하도록 수정)
    const injectScript = formWrapper.querySelector ? formWrapper.querySelector('script') : null;
    if (injectScript && injectScript.textContent.includes('function injectPDFData')) {
      try {
        // injectPDFData 함수를 formWrapper 내부에서만 작동하도록 수정하여 호출
        const injectFunctionCode = injectScript.textContent.replace(
          /document\.querySelectorAll/g,
          'formWrapper.querySelectorAll'
        );
        const executeInject = new Function('formData', 'formWrapper', `
          ${injectFunctionCode}
          return injectPDFData(formData);
        `);
        executeInject(formData, formWrapper);
      } catch (e) {
        console.warn('PDF data injection error:', e);
      }
    }
    
    // 직접 데이터 주입 (formWrapper 내부에서만)
    // 1. pdf-value 요소 처리
    formWrapper.querySelectorAll('.pdf-value[data-field]').forEach(element => {
      const fieldName = element.getAttribute('data-field');
      const value = formData[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        element.textContent = value;
      } else {
        element.textContent = '________________';
      }
    });
    
    // 2. pdf-radio 요소 처리 (호칭, 국가번호 등)
    formWrapper.querySelectorAll('.pdf-radio').forEach(element => {
      const fieldGroup = element.closest('.pdf-option-group[data-field]');
      if (fieldGroup) {
        const groupFieldName = fieldGroup.getAttribute('data-field');
        const groupValue = formData[groupFieldName];
        const elementValue = element.getAttribute('data-value');
        
        // 값이 정확히 일치하면 선택 표시
        if (groupValue === elementValue || String(groupValue) === String(elementValue)) {
          element.classList.add('checked');
        }
      }
    });
    
    // 3. pdf-checkbox 요소 처리
    formWrapper.querySelectorAll('.pdf-checkbox').forEach(element => {
      const fieldGroup = element.closest('[data-field]');
      if (fieldGroup) {
        const groupFieldName = fieldGroup.getAttribute('data-field');
        const groupValue = formData[groupFieldName];
        const elementValue = element.getAttribute('data-value');
        if (Array.isArray(groupValue) && groupValue.includes(elementValue)) {
          element.classList.add('checked');
        } else if (typeof groupValue === 'string' && groupValue.split(',').includes(elementValue)) {
          element.classList.add('checked');
        } else if (groupValue === true || groupValue === 'true') {
          // 약관동의 체크박스는 boolean true로 처리
          element.classList.add('checked');
        }
      }
    });
    
    // 4. 기타 data-field 요소 처리 (pdf-value가 아닌 경우)
    formWrapper.querySelectorAll('[data-field]').forEach(element => {
      if (element.classList.contains('pdf-value') || 
          element.classList.contains('pdf-radio') || 
          element.classList.contains('pdf-checkbox') ||
          element.classList.contains('pdf-option-group')) {
        // 이미 처리된 요소는 건너뛰기
        return;
      }
      const fieldName = element.getAttribute('data-field');
      const value = formData[fieldName];
      if (value !== undefined && value !== null && value !== '') {
        element.textContent = value;
      }
    });
    
    // 5. 조건부 섹션 표시/숨김 처리
    formWrapper.querySelectorAll('[data-conditional]').forEach(element => {
      const conditionalField = element.getAttribute('data-conditional');
      const conditionalValues = element.getAttribute('data-conditional-values').split(',').map(v => v.trim());
      const fieldValue = formData[conditionalField];
      
      // 체크박스의 경우 배열이나 쉼표로 구분된 문자열일 수 있음
      let shouldShow = false;
      if (Array.isArray(fieldValue)) {
        shouldShow = conditionalValues.some(cv => fieldValue.includes(cv));
      } else if (typeof fieldValue === 'string' && fieldValue.includes(',')) {
        const fieldValues = fieldValue.split(',').map(v => v.trim());
        shouldShow = conditionalValues.some(cv => fieldValues.includes(cv));
      } else {
        shouldShow = conditionalValues.includes(String(fieldValue));
      }
      
      if (shouldShow) {
        element.style.display = 'block';
      } else {
        element.style.display = 'none';
      }
    });
    
    // 서명 이미지 직접 주입 (div.signature-line에 img 태그 생성)
    const signatureLine = formWrapper.querySelector('[data-field="signature-image"]');
    if (signatureLine && formData['signature-image']) {
      signatureLine.innerHTML = '';
      // 이미지 생성
      const img = document.createElement('img');
      img.src = formData['signature-image'];
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.maxHeight = '100px';
      signatureLine.appendChild(img);
    }
    
    // 약관동의 체크박스 체크 (필수이므로 항상 체크됨)
    const confirmationCheckbox = formWrapper.querySelector('[data-field="confirmation-checkbox"]');
    if (confirmationCheckbox) {
      confirmationCheckbox.classList.add('checked');
    }
    
    // 매장/직원 정보 주입 (PDF 전용 필드)
    const currentStaff = load(STORAGE.staff, null);
    const reviewStaffId = load(STORAGE.reviewStaff, '');
    const reviewStaff = SAMPLE_STAFF.find(s => s.staffId === reviewStaffId);
    
    // 매장 정보 (currentStaff 또는 reviewStaff에서 가져오기)
    if (currentStaff && currentStaff.storeId) {
      const storeField = formWrapper.querySelector('[data-field="store-registration"]');
      if (storeField) {
        storeField.textContent = currentStaff.storeName || currentStaff.storeId;
      }
    } else if (reviewStaff && reviewStaff.storeId) {
      const storeField = formWrapper.querySelector('[data-field="store-registration"]');
      if (storeField) {
        storeField.textContent = reviewStaff.storeName || reviewStaff.storeId;
      }
    }
    
    // 담당 직원 정보
    if (reviewStaff) {
      const staffField = formWrapper.querySelector('[data-field="responsible-staff"]');
      if (staffField) {
        staffField.textContent = reviewStaff.name || reviewStaff.staffId;
      }
    }
  }

  // ---------- Export to window.HKPOS ----------
  window.HKPOS.FormHandler = {
    requestFormDataFromIframe,
    sendDataToForm,
    fillFormData,
    loadFormHTML,
    collectFormDataFromInput,
    injectPDFDataToTemplate,
  };
})();
