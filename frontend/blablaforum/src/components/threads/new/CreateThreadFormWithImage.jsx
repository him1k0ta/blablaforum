import React, { useState } from 'react';

import { useThreads } from '../../../ThreadsContext';

import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import styles from '../../../style/threads/new/CreateThreadFormWithImage.module.css';



const CreateThreadFormWithImage = ({ boardSlug }) => {

  const [formData, setFormData] = useState({

    title: '',

    content: '',

    image: null

  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState(null);

  const { createThread, fetchThreads } = useThreads();

  const navigate = useNavigate();



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {

      // Проверка типа файла

      if (!file.type.startsWith('image/')) {

        toast.error('Пожалуйста, выберите изображение');

        return;

      }

      // Проверка размера (макс 5MB)

      if (file.size > 5 * 1024 * 1024) {

        toast.error('Изображение должно быть меньше 5MB');

        return;

      }

      setFormData(prev => ({

        ...prev,

        image: file

      }));

      // Создание превью

      const reader = new FileReader();

      reader.onload = (e) => {

        setImagePreview(e.target.result);

      };

      reader.readAsDataURL(file);

    }

  };



  const handleRemoveImage = () => {

    setFormData(prev => ({

      ...prev,

      image: null

    }));

    setImagePreview(null);

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    setIsSubmitting(true);

    

    try {

      // Создаем объект данных для отправки

      const submitData = {
        title: formData.title,
        content: formData.content,
      };

      // Добавляем изображение, если оно есть
      if (formData.image) {
        submitData.image = formData.image;
      }

      await createThread(submitData);

      
      toast.success('Тред успешно создан!');
      await fetchThreads(); // Обновляем список тредов
      
      // Перенаправление на главную страницу с тредами
      navigate('/threads', { replace: true }); 
      
    } catch (err) {
      console.error('Thread creation error:', err);
      
      // Детальная обработка ошибок
      let errorMessage = 'Ошибка при создании треда';
      
      if (err.data) {
        if (typeof err.data === 'string') {
          errorMessage = err.data;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.non_field_errors) {
          errorMessage = err.data.non_field_errors[0];
        } else if (err.data.image) {
          errorMessage = `Ошибка изображения: ${err.data.image[0]}`;
        } else if (err.data.title) {
          errorMessage = `Ошибка заголовка: ${err.data.title[0]}`;
        } else if (err.data.content) {
          errorMessage = `Ошибка содержания: ${err.data.content[0]}`;
        } else {
          errorMessage = 'Ошибка валидации данных';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }

  };


  return (

    <div className={styles.threadFormContainer}>

      <h2 className={styles.formTitle}>Создание нового треда</h2>

      <form className={styles.threadForm} onSubmit={handleSubmit}>

        <div className={styles.formGroup}>

          <label htmlFor="title">Заголовок *</label>

          <input

            type="text"

            id="title"

            name="title"

            placeholder="Введите заголовок треда"

            value={formData.title}

            onChange={handleChange}

            required

            minLength="3"

          />

        </div>



        <div className={styles.formGroup}>

          <label htmlFor="content">Содержание *</label>

          <textarea

            id="content"

            name="content"

            placeholder="Опишите вашу тему..."

            rows={6}

            value={formData.content}

            onChange={handleChange}

            required

            minLength="10"

          />

        </div>



        <div className={styles.formGroup}>

          <label htmlFor="image">Изображение (необязательно)</label>

          <div className={styles.imageUploadArea}>

            <input

              type="file"

              id="image"

              name="image"

              accept="image/*"

              onChange={handleImageChange}

              className={styles.imageInput}

            />

            {imagePreview ? (

              <div className={styles.imagePreview}>

                <img src={imagePreview} alt="Preview" className={styles.previewImg} />

                <button

                  type="button"

                  onClick={handleRemoveImage}

                  className={styles.removeImageBtn}

                >

                  Удалить изображение

                </button>

              </div>

            ) : (

              <div className={styles.uploadPlaceholder}>

                <div className={styles.uploadIcon}></div>

                <p>Нажмите, чтобы выбрать изображение</p>

                <p className={styles.uploadHint}>JPG, PNG, GIF (макс. 5MB)</p>

              </div>

            ) }

          </div>

        </div>



        


        <button 

          type="submit" 

          className={styles.submitBtn}

          disabled={isSubmitting}

        >

          {isSubmitting ? 'Создание...' : 'Создать тред'}

        </button>

      </form>

    </div>

  );

};



export default CreateThreadFormWithImage;
