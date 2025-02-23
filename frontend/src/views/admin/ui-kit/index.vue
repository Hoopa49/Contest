<template>
  <div class="ui-kit-page">
    <div class="ui-kit">
      <h1 class="ui-kit__title">UI Kit</h1>
      
      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('buttons')">
          <h2>Кнопки</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.buttons }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.buttons" class="ui-kit__components">
          <div class="button-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('buttons', 'variants')">
              <h3>Варианты</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.buttons.variants }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.buttons.variants" class="button-group">
              <UiButton>Основная</UiButton>
              <UiButton variant="secondary">Дополнительная</UiButton>
              <UiButton variant="success">Успех</UiButton>
              <UiButton variant="warning">Предупреждение</UiButton>
              <UiButton variant="danger">Удалить</UiButton>
              <UiButton variant="info">Информация</UiButton>
              <UiButton variant="ghost">Прозрачная</UiButton>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('buttons', 'withIcon')">
              <h3>С иконками</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.buttons.withIcon }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.buttons.withIcon" class="button-group">
              <UiButton>
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </template>
                Вперед
              </UiButton>
              <UiButton variant="secondary">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                </template>
                Сохранить
              </UiButton>
              <UiButton variant="danger">
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </template>
                Удалить
              </UiButton>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('buttons', 'sizes')">
              <h3>Размеры</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.buttons.sizes }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.buttons.sizes" class="button-group">
              <UiButton size="small">Маленькая</UiButton>
              <UiButton size="medium">Средняя</UiButton>
              <UiButton size="large">Большая</UiButton>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('buttons', 'states')">
              <h3>Состояния</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.buttons.states }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.buttons.states" class="button-group">
              <UiButton disabled>Неактивная</UiButton>
              <UiButton loading>Загрузка</UiButton>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('forms')">
          <h2>Формы</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.forms }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.forms" class="ui-kit__components">
          <div class="form-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('forms', 'inputs')">
              <h3>Текстовые поля</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.forms.inputs }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.forms.inputs" class="form-group">
              <UiInput
                v-model="inputDemo.default"
                label="Обычное поле"
                placeholder="Введите текст"
              />
              
              <UiInput
                v-model="inputDemo.withHint"
                label="Поле с подсказкой"
                placeholder="Введите имя"
                hint="Используйте настоящее имя"
              />
              
              <UiInput
                v-model="inputDemo.required"
                label="Обязательное поле"
                placeholder="Введите email"
                required
              />
              
              <UiInput
                v-model="inputDemo.error"
                label="Поле с ошибкой"
                placeholder="Введите email"
                error="Неверный формат email"
              />
              
              <UiInput
                v-model="inputDemo.disabled"
                label="Отключенное поле"
                placeholder="Недоступно"
                disabled
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('forms', 'selects')">
              <h3>Выпадающие списки</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.forms.selects }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.forms.selects" class="form-group">
              <UiSelect
                v-model="selectDemo.single"
                label="Обычный список"
                placeholder="Выберите значение"
                :options="selectOptions"
              />

              <UiSelect
                v-model="selectDemo.multiple"
                label="Множественный выбор"
                placeholder="Выберите значения"
                :options="selectOptions"
                multiple
              />

              <UiSelect
                v-model="selectDemo.withHint"
                label="Список с подсказкой"
                placeholder="Выберите город"
                :options="cityOptions"
                hint="Выберите город проживания"
              />

              <UiSelect
                v-model="selectDemo.required"
                label="Обязательный выбор"
                placeholder="Выберите роль"
                :options="roleOptions"
                required
              />

              <UiSelect
                v-model="selectDemo.error"
                label="Список с ошибкой"
                placeholder="Выберите категорию"
                :options="categoryOptions"
                error="Необходимо выбрать категорию"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('forms', 'checkboxes')">
              <h3>Чекбоксы</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.forms.checkboxes }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.forms.checkboxes" class="form-group">
              <UiCheckbox
                v-model="checkboxDemo.default"
                label="Обычный чекбокс"
              />
              
              <UiCheckbox
                v-model="checkboxDemo.withHint"
                label="Чекбокс с подсказкой"
                hint="Дополнительная информация о выборе"
              />
              
              <UiCheckbox
                v-model="checkboxDemo.required"
                label="Обязательный чекбокс"
                required
              />
              
              <UiCheckbox
                v-model="checkboxDemo.error"
                label="Чекбокс с ошибкой"
                error="Это поле обязательно для заполнения"
              />
              
              <UiCheckbox
                v-model="checkboxDemo.disabled"
                label="Отключенный чекбокс"
                disabled
              />

              <UiCheckbox
                v-model="checkboxDemo.terms"
                label="Я принимаю условия использования и политику конфиденциальности"
                required
                hint="Необходимо для продолжения регистрации"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('forms', 'radio')">
              <h3>Радиокнопки</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.forms.radio }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.forms.radio" class="form-group">
              <div class="radio-group">
                <div class="radio-group__label">Обычные радиокнопки</div>
                <UiRadio
                  v-model="radioDemo.default"
                  name="default-radio"
                  value="option1"
                  label="Вариант 1"
                />
                <UiRadio
                  v-model="radioDemo.default"
                  name="default-radio"
                  value="option2"
                  label="Вариант 2"
                />
                <UiRadio
                  v-model="radioDemo.default"
                  name="default-radio"
                  value="option3"
                  label="Вариант 3"
                />
              </div>

              <div class="radio-group">
                <div class="radio-group__label">Радиокнопки с подсказками</div>
                <UiRadio
                  v-model="radioDemo.withHints"
                  name="hints-radio"
                  value="fast"
                  label="Быстрая доставка"
                  hint="Доставка в течение 1-2 дней"
                />
                <UiRadio
                  v-model="radioDemo.withHints"
                  name="hints-radio"
                  value="standard"
                  label="Стандартная доставка"
                  hint="Доставка в течение 3-5 дней"
                />
                <UiRadio
                  v-model="radioDemo.withHints"
                  name="hints-radio"
                  value="economy"
                  label="Экономная доставка"
                  hint="Доставка в течение 7-10 дней"
                />
              </div>

              <div class="radio-group">
                <div class="radio-group__label">Обязательный выбор</div>
                <UiRadio
                  v-model="radioDemo.required"
                  name="required-radio"
                  value="yes"
                  label="Да"
                  required
                />
                <UiRadio
                  v-model="radioDemo.required"
                  name="required-radio"
                  value="no"
                  label="Нет"
                  required
                />
              </div>

              <div class="radio-group">
                <div class="radio-group__label">Радиокнопки с ошибкой</div>
                <UiRadio
                  v-model="radioDemo.error"
                  name="error-radio"
                  value="option1"
                  label="Вариант 1"
                  error="Необходимо выбрать вариант"
                />
                <UiRadio
                  v-model="radioDemo.error"
                  name="error-radio"
                  value="option2"
                  label="Вариант 2"
                  error="Необходимо выбрать вариант"
                />
              </div>

              <div class="radio-group">
                <div class="radio-group__label">Отключенные радиокнопки</div>
                <UiRadio
                  v-model="radioDemo.disabled"
                  name="disabled-radio"
                  value="option1"
                  label="Вариант 1"
                  disabled
                />
                <UiRadio
                  v-model="radioDemo.disabled"
                  name="disabled-radio"
                  value="option2"
                  label="Вариант 2"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('notifications')">
          <h2>Уведомления</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.notifications }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.notifications" class="ui-kit__components">
          <div class="notification-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('notifications', 'alerts')">
              <h3>Алерты</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.notifications.alerts }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.notifications.alerts" class="alert-group">
              <UiAlert
                v-model="alertDemo.info"
                type="info"
                title="Информационное сообщение"
                message="Это информационное сообщение для пользователя"
              />
              
              <UiAlert
                v-model="alertDemo.success"
                type="success"
                title="Успешное действие"
                message="Операция успешно выполнена"
              />
              
              <UiAlert
                v-model="alertDemo.warning"
                type="warning"
                title="Предупреждение"
                message="Обратите внимание на важную информацию"
              />
              
              <UiAlert
                v-model="alertDemo.error"
                type="error"
                title="Ошибка"
                message="Произошла ошибка при выполнении операции"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('notifications', 'toasts')">
              <h3>Всплывающие уведомления</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.notifications.toasts }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.notifications.toasts" class="toast-group">
              <UiToast
                v-model="toastDemo.info"
                type="info"
                title="Новое сообщение"
                message="У вас новое сообщение от пользователя"
                :duration="8000"
              />
              
              <UiToast
                v-model="toastDemo.success"
                type="success"
                title="Файл сохранен"
                message="Ваш файл успешно сохранен в облаке"
                :duration="7000"
              />
              
              <UiToast
                v-model="toastDemo.warning"
                type="warning"
                title="Низкий заряд"
                message="Заряд батареи ниже 20%"
                :duration="6000"
              />
              
              <UiToast
                v-model="toastDemo.error"
                type="error"
                title="Ошибка сети"
                message="Не удалось подключиться к серверу"
                :duration="5000"
              />
            </div>

            <div v-show="!collapsedSubsections.notifications.toasts" class="notification-actions">
              <UiButton @click="resetAlerts">Показать алерты</UiButton>
              <UiButton @click="resetToasts">Показать уведомления</UiButton>
            </div>
          </div>
        </div>
      </div>
      
      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('tables')">
          <h2>Таблицы и данные</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.tables }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.tables" class="ui-kit__components">
          <div class="table-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('tables', 'basic')">
              <h3>Базовая таблица</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.tables.basic }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.tables.basic">
              <UiTable
                :items="tableDemo.basic.items"
                :columns="tableDemo.basic.columns"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('tables', 'sortable')">
              <h3>Таблица с сортировкой</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.tables.sortable }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.tables.sortable">
              <UiTable
                :items="tableDemo.sortable.items"
                :columns="tableDemo.sortable.columns"
                :default-sort="{ key: 'name', order: 'asc' }"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('tables', 'selectable')">
              <h3>Таблица с выбором строк</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.tables.selectable }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.tables.selectable">
              <UiTable
                v-model="tableDemo.selectable.selected"
                :items="tableDemo.selectable.items"
                :columns="tableDemo.selectable.columns"
                selectable
              >
                <template #header>
                  <div class="table-demo__header">
                    <span>Выбрано: {{ tableDemo.selectable.selected.length }}</span>
                    <UiButton 
                      v-if="tableDemo.selectable.selected.length"
                      size="small"
                      @click="tableDemo.selectable.selected = []"
                    >
                      Очистить выбор
                    </UiButton>
                  </div>
                </template>
              </UiTable>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('tables', 'paginated')">
              <h3>Таблица с пагинацией</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.tables.paginated }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.tables.paginated">
              <UiTable
                :items="tableDemo.paginated.items"
                :columns="tableDemo.paginated.columns"
                :current-page="tableDemo.paginated.currentPage"
                :per-page="5"
                :total-items="tableDemo.paginated.totalItems"
                @update:current-page="tableDemo.paginated.currentPage = $event"
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('tables', 'actions')">
              <h3>Таблица с действиями</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.tables.actions }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.tables.actions">
              <UiTable
                :items="tableDemo.actions.items"
                :columns="tableDemo.actions.columns"
              >
                <template #actions="{ item }">
                  <div class="table-demo__actions">
                    <UiButton
                      size="small"
                      variant="secondary"
                      @click="alert(`Просмотр ${item.name}`)"
                    >
                      Просмотр
                    </UiButton>
                    <UiButton
                      size="small"
                      variant="danger"
                      @click="alert(`Удаление ${item.name}`)"
                    >
                      Удалить
                    </UiButton>
                  </div>
                </template>
              </UiTable>
            </div>
          </div>
        </div>
      </div>

      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('cards')">
          <h2>Карточки</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.cards }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.cards" class="ui-kit__components">
          <div class="card-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('cards', 'variants')">
              <h3>Варианты карточек</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.cards.variants }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.cards.variants" class="card-group">
              <UiCard
                title="Обычная карточка"
                subtitle="С тенью по умолчанию"
              >
                <p>Это базовая карточка с заголовком и подзаголовком. Она использует стиль по умолчанию с легкой тенью.</p>
              </UiCard>

              <UiCard
                title="Карточка с рамкой"
                subtitle="Без тени"
                variant="outlined"
              >
                <p>Это карточка с рамкой вместо тени. Такой вариант лучше подходит для светлых фонов.</p>
              </UiCard>

              <UiCard
                title="Объемная карточка"
                subtitle="С усиленной тенью"
                variant="elevated"
              >
                <p>Это карточка с более заметной тенью, которая создает эффект поднятия над поверхностью.</p>
              </UiCard>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('cards', 'withImages')">
              <h3>Карточки с изображениями</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.cards.withImages }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.cards.withImages" class="card-group">
              <UiCard
                title="Природа"
                subtitle="Красивый пейзаж"
                image="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
                image-alt="Горный пейзаж"
                hoverable
              >
                <p>Карточка с изображением и эффектом при наведении. Изображение автоматически масштабируется.</p>
              </UiCard>

              <UiCard
                title="Архитектура"
                subtitle="Современный дизайн"
                image="https://images.unsplash.com/photo-1511818966892-d7d671e672a2"
                image-alt="Современное здание"
                hoverable
              >
                <p>Еще одна карточка с изображением и эффектом при наведении.</p>
              </UiCard>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('cards', 'withActions')">
              <h3>Карточки с действиями</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.cards.withActions }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.cards.withActions" class="card-group">
              <UiCard
                title="Подписка Premium"
                subtitle="Расширенные возможности"
                hoverable
              >
                <p>Получите доступ ко всем функциям и возможностям платформы.</p>
                <template #footer>
                  <div class="card-actions">
                    <UiButton size="small">Подробнее</UiButton>
                    <UiButton size="small" variant="primary">Подключить</UiButton>
                  </div>
                </template>
              </UiCard>

              <UiCard
                title="Корзина"
                subtitle="3 товара"
                hoverable
              >
                <div class="cart-items">
                  <div class="cart-item">
                    <span>Товар 1</span>
                    <span>1 500 ₽</span>
                  </div>
                  <div class="cart-item">
                    <span>Товар 2</span>
                    <span>2 300 ₽</span>
                  </div>
                  <div class="cart-item">
                    <span>Товар 3</span>
                    <span>800 ₽</span>
                  </div>
                  <div class="cart-total">
                    <span>Итого:</span>
                    <span>4 600 ₽</span>
                  </div>
                </div>
                <template #footer>
                  <div class="card-actions">
                    <UiButton size="small" variant="secondary">Очистить</UiButton>
                    <UiButton size="small" variant="primary">Оформить</UiButton>
                  </div>
                </template>
              </UiCard>
            </div>
          </div>
        </div>
      </div>

      <div class="ui-kit__section">
        <div class="ui-kit__section-header" @click="toggleSection('lists')">
          <h2>Списки</h2>
          <button class="ui-kit__collapse-button">
            <svg 
              class="ui-kit__collapse-icon"
              :class="{ 'ui-kit__collapse-icon--rotated': collapsedSections.lists }"
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div v-show="!collapsedSections.lists" class="ui-kit__components">
          <div class="list-demo">
            <div class="ui-kit__subsection-header" @click="toggleSubsection('lists', 'basic')">
              <h3>Базовый список</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.lists.basic }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.lists.basic">
              <UiList
                :items="listDemo.basic.items"
                hoverable
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('lists', 'bordered')">
              <h3>Список с границами</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.lists.bordered }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.lists.bordered">
              <UiList
                :items="listDemo.bordered.items"
                variant="bordered"
                hoverable
              />
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('lists', 'divided')">
              <h3>Список с разделителями</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.lists.divided }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.lists.divided">
              <UiList
                :items="listDemo.divided.items"
                variant="divided"
                hoverable
              >
                <template #icon="{ item }">
                  <svg v-if="item.status === 'completed'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#22c55e">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#f59e0b">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
                  </svg>
                </template>
                <template #meta="{ item }">
                  {{ item.date }}
                </template>
              </UiList>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('lists', 'actions')">
              <h3>Список с действиями</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.lists.actions }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.lists.actions">
              <UiList
                :items="listDemo.actions.items"
                variant="bordered"
                hoverable
              >
                <template #meta="{ item }">
                  <span :class="['status-badge', `status-badge--${item.status}`]">
                    {{ item.status }}
                  </span>
                </template>
                <template #actions="{ item }">
                  <UiButton 
                    size="small"
                    variant="secondary"
                    @click.stop="alert(`Просмотр ${item.title}`)"
                  >
                    Просмотр
                  </UiButton>
                  <UiButton 
                    size="small"
                    variant="danger"
                    @click.stop="alert(`Удаление ${item.title}`)"
                  >
                    Удалить
                  </UiButton>
                </template>
              </UiList>
            </div>

            <div class="ui-kit__subsection-header" @click="toggleSubsection('lists', 'interactive')">
              <h3>Интерактивный список</h3>
              <button class="ui-kit__collapse-button">
                <svg 
                  class="ui-kit__collapse-icon"
                  :class="{ 'ui-kit__collapse-icon--rotated': collapsedSubsections.lists.interactive }"
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div v-show="!collapsedSubsections.lists.interactive">
              <UiList
                v-model="listDemo.interactive.selected"
                :items="listDemo.interactive.items"
                variant="bordered"
                hoverable
              >
                <template #icon="{ item }">
                  <img 
                    :src="item.avatar" 
                    :alt="item.title"
                    class="avatar"
                  >
                </template>
                <template #subtitle="{ item }">
                  {{ item.email }}
                </template>
                <template #meta="{ item }">
                  <span class="role-badge">
                    {{ item.role }}
                  </span>
                </template>
              </UiList>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import UiButton from '@/components/ui/buttons/UiButton.vue'
import UiInput from '@/components/ui/forms/UiInput.vue'
import UiSelect from '@/components/ui/forms/UiSelect.vue'
import UiCheckbox from '@/components/ui/forms/UiCheckbox.vue'
import UiRadio from '@/components/ui/forms/UiRadio.vue'
import UiAlert from '@/components/ui/notifications/UiAlert.vue'
import UiToast from '@/components/ui/notifications/UiToast.vue'
import UiTable from '@/components/ui/data/UiTable.vue'
import UiCard from '@/components/ui/data/UiCard.vue'
import UiList from '@/components/ui/data/UiList.vue'

const inputDemo = ref({
  default: '',
  withHint: '',
  required: '',
  error: 'test@',
  disabled: 'Недоступное значение'
})

const selectDemo = ref({
  single: '',
  multiple: [],
  withHint: '',
  required: '',
  error: ''
})

const checkboxDemo = ref({
  default: false,
  withHint: true,
  required: false,
  error: false,
  disabled: true,
  terms: false
})

const radioDemo = ref({
  default: 'option1',
  withHints: 'standard',
  required: '',
  error: '',
  disabled: 'option1'
})

const alertDemo = ref({
  info: false,
  success: false,
  warning: false,
  error: false
})

const toastDemo = ref({
  info: false,
  success: false,
  warning: false,
  error: false
})

const tableDemo = ref({
  basic: {
    columns: [
      { key: 'name', label: 'Имя' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Роль' }
    ],
    items: [
      { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'Администратор' },
      { id: 2, name: 'Петр Петров', email: 'petr@example.com', role: 'Пользователь' },
      { id: 3, name: 'Анна Сидорова', email: 'anna@example.com', role: 'Редактор' }
    ]
  },
  sortable: {
    columns: [
      { key: 'name', label: 'Название', sortable: true },
      { key: 'category', label: 'Категория', sortable: true },
      { key: 'price', label: 'Цена', sortable: true }
    ],
    items: [
      { id: 1, name: 'Ноутбук', category: 'Электроника', price: 75000 },
      { id: 2, name: 'Смартфон', category: 'Электроника', price: 45000 },
      { id: 3, name: 'Наушники', category: 'Аксессуары', price: 12000 },
      { id: 4, name: 'Клавиатура', category: 'Периферия', price: 8000 }
    ]
  },
  selectable: {
    columns: [
      { key: 'name', label: 'ФИО' },
      { key: 'position', label: 'Должность' },
      { key: 'department', label: 'Отдел' }
    ],
    items: [
      { id: 1, name: 'Александр Александров', position: 'Разработчик', department: 'IT' },
      { id: 2, name: 'Мария Иванова', position: 'Дизайнер', department: 'Дизайн' },
      { id: 3, name: 'Дмитрий Петров', position: 'Менеджер', department: 'Продажи' },
      { id: 4, name: 'Елена Сидорова', position: 'Аналитик', department: 'IT' }
    ],
    selected: []
  },
  paginated: {
    columns: [
      { key: 'order', label: 'Номер заказа' },
      { key: 'customer', label: 'Клиент' },
      { key: 'status', label: 'Статус' },
      { key: 'total', label: 'Сумма' }
    ],
    items: [
      { id: 1, order: '#001', customer: 'Иван Иванов', status: 'Оплачен', total: '15000 ₽' },
      { id: 2, order: '#002', customer: 'Петр Петров', status: 'В обработке', total: '8500 ₽' },
      { id: 3, order: '#003', customer: 'Анна Сидорова', status: 'Доставлен', total: '22000 ₽' },
      { id: 4, order: '#004', customer: 'Мария Иванова', status: 'Отменен', total: '12500 ₽' },
      { id: 5, order: '#005', customer: 'Дмитрий Петров', status: 'Оплачен', total: '9000 ₽' }
    ],
    currentPage: 1,
    totalItems: 5
  },
  actions: {
    columns: [
      { key: 'name', label: 'Название' },
      { key: 'status', label: 'Статус' },
      { key: 'date', label: 'Дата' }
    ],
    items: [
      { id: 1, name: 'Проект А', status: 'Активен', date: '2024-03-15' },
      { id: 2, name: 'Проект Б', status: 'Завершен', date: '2024-03-10' },
      { id: 3, name: 'Проект В', status: 'На паузе', date: '2024-03-05' }
    ]
  }
})

const selectOptions = [
  { value: 'option1', label: 'Вариант 1' },
  { value: 'option2', label: 'Вариант 2' },
  { value: 'option3', label: 'Вариант 3' },
  { value: 'option4', label: 'Вариант 4' }
]

const cityOptions = [
  { value: 'msk', label: 'Москва' },
  { value: 'spb', label: 'Санкт-Петербург' },
  { value: 'nsk', label: 'Новосибирск' },
  { value: 'kzn', label: 'Казань' }
]

const roleOptions = [
  { value: 'admin', label: 'Администратор' },
  { value: 'user', label: 'Пользователь' },
  { value: 'editor', label: 'Редактор' }
]

const categoryOptions = [
  { value: 'tech', label: 'Технологии' },
  { value: 'science', label: 'Наука' },
  { value: 'art', label: 'Искусство' },
  { value: 'sport', label: 'Спорт' }
]

const resetAlerts = () => {
  alertDemo.value = {
    info: false,
    success: false,
    warning: false,
    error: false
  }
}

const resetToasts = () => {
  toastDemo.value = {
    info: false,
    success: false,
    warning: false,
    error: false
  }
}

const listDemo = ref({
  basic: {
    items: [
      { id: 1, title: 'Элемент 1', subtitle: 'Описание элемента 1' },
      { id: 2, title: 'Элемент 2', subtitle: 'Описание элемента 2' },
      { id: 3, title: 'Элемент 3', subtitle: 'Описание элемента 3' }
    ]
  },
  actions: {
    items: [
      { id: 1, name: 'Проект А', subtitle: 'Веб-разработка', status: 'active' },
      { id: 2, name: 'Проект Б', subtitle: 'Мобильное приложение', status: 'paused' },
      { id: 3, name: 'Проект В', subtitle: 'Дизайн', status: 'completed' }
    ]
  },
  bordered: {
    items: [
      { id: 1, title: 'Новости', subtitle: '15 непрочитанных' },
      { id: 2, title: 'Сообщения', subtitle: '3 новых сообщения' },
      { id: 3, title: 'Задачи', subtitle: '5 активных задач' }
    ]
  },
  divided: {
    items: [
      { id: 1, title: 'Подготовить презентацию', status: 'completed', date: '15.03.2024' },
      { id: 2, title: 'Отправить отчет', status: 'pending', date: '16.03.2024' },
      { id: 3, title: 'Провести встречу', status: 'completed', date: '17.03.2024' },
      { id: 4, title: 'Обновить документацию', status: 'pending', date: '18.03.2024' }
    ]
  },
  interactive: {
    items: [
      { 
        id: 1, 
        title: 'Иван Иванов', 
        email: 'ivan@example.com',
        role: 'Администратор',
        avatar: 'https://i.pravatar.cc/40?img=1'
      },
      { 
        id: 2, 
        title: 'Мария Петрова', 
        email: 'maria@example.com',
        role: 'Модератор',
        avatar: 'https://i.pravatar.cc/40?img=2'
      },
      { 
        id: 3, 
        title: 'Алексей Сидоров', 
        email: 'alex@example.com',
        role: 'Пользователь',
        avatar: 'https://i.pravatar.cc/40?img=3'
      }
    ],
    selected: null
  }
})

const collapsedSections = ref(JSON.parse(localStorage.getItem('uiKitCollapsedSections')) || {
  buttons: false,
  forms: false,
  notifications: false,
  tables: false,
  cards: false,
  lists: false
})

const collapsedSubsections = ref(JSON.parse(localStorage.getItem('uiKitCollapsedSubsections')) || {
  buttons: {
    variants: false,
    withIcon: false,
    sizes: false,
    states: false
  },
  forms: {
    inputs: false,
    selects: false,
    checkboxes: false,
    radio: false
  },
  notifications: {
    alerts: false,
    toasts: false
  },
  tables: {
    basic: false,
    sortable: false,
    selectable: false,
    paginated: false,
    actions: false
  },
  cards: {
    variants: false,
    withImages: false,
    withActions: false
  },
  lists: {
    basic: false,
    bordered: false,
    divided: false,
    actions: false,
    interactive: false
  }
})

const toggleSection = (section) => {
  collapsedSections.value[section] = !collapsedSections.value[section]
  localStorage.setItem('uiKitCollapsedSections', JSON.stringify(collapsedSections.value))
}

const toggleSubsection = (section, subsection) => {
  collapsedSubsections.value[section][subsection] = !collapsedSubsections.value[section][subsection]
  localStorage.setItem('uiKitCollapsedSubsections', JSON.stringify(collapsedSubsections.value))
}
</script>

<style lang="scss">
@use '@/styles/pages/ui-kit';
</style> 