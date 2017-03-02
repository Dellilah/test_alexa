module Api
  class UsersController < ::ApplicationController
    def index
      @users = User.all
    end

    def with_ability
      @users = Ability
        .where(name: params[:ability])
        .inject([]) { |result, ability| result+ability.users}
        .uniq
    end
  end
end
