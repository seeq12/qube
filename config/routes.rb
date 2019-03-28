Rails.application.routes.draw do
  root to: 'application#qube'
  mount ActionCable.server => '/cable'

  post :zoom, to: 'meetings#zoom'
  post :slack, to: 'slack#accept'
  post 'slack/command', to: 'slack#command'
  post :subscribe, to: 'subscriptions#create'

  resources :floors, only: [:index, :create, :update, :destroy] do
    patch :reorder, on: :collection
  end

  resources :departments, only: [:index, :create, :update, :destroy] do
    post :invite, on: :member
  end

  resources :rooms, only: [:index, :update] do
    patch :enter, on: :member
    post :invite, on: :member
    post :knock, on: :member
    patch :claim, on: :member
    patch :start_meeting, on: :member
    patch :end_meeting, on: :member
    patch :cancel_meeting, on: :member
    patch :star, on: :member
    patch :unstar, on: :member
  end

  resources :room_requests, only: [] do
    post :accept, on: :collection
  end

  devise_for :users, controllers: { omniauth_callbacks: 'callbacks' }

  resources :users, only: [:index, :update, :destroy] do
    post :welcome, on: :collection
    post :invite, on: :member
    patch :call, on: :member
    patch :send_home, on: :member
    patch :watch, on: :member
    patch :unwatch, on: :member
    get :message, on: :member
    get :slack_presence, on: :member
    get :guests, on: :collection
  end

  resources :settings, only: [:index] do
    patch :master_logout, on: :collection
    patch :master_refresh, on: :collection
    patch :update, on: :collection
  end

  get :history, to: 'home#history'
  get :high_score, to: 'home#high_score'
  get :slack_urls, to: 'home#slack_urls'
  get :themes, to: 'home#themes'
  get :weather, to: 'home#weather'
  get :monitor, to: 'home#monitor'
end
